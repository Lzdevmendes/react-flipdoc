import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { redis } from '../redis/client'
import { jobsRepository } from '../db/jobsRepository'
import pLimit from 'p-limit'

const CONCURRENCY = 3            // quantos jobs ao mesmo tempo
const MAX_RETRIES = 3            // quantas tentativas por job
const QUEUE_KEY = 'convert:queue'

const limit = pLimit(CONCURRENCY)

interface QueueMessage {
  jobId: string
  retries?: number
}

async function runConversion(jobId: string, retries: number = 0): Promise<void> {
  // Buscar job do banco de dados
  const job = await jobsRepository.findById(jobId)
  if (!job) {
    console.error(`❌ Job ${jobId} não encontrado no banco de dados`)
    return
  }

  const outdir = path.join(__dirname, '..', '..', 'storage')
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true })

  const ext = job.target_format === 'pdf' ? 'pdf' : 'docx'
  const outputName = `${Date.now()}-${path.basename(job.original_name, path.extname(job.original_name))}.${ext}`
  const outputPath = path.join(outdir, outputName)
  const cmd = `libreoffice --headless --convert-to ${ext} --outdir ${outdir} "${job.file_path}"`

  // Atualizar status para "processing"
  await jobsRepository.update(jobId, { status: 'processing' })
  console.log(`🟡 [${jobId}] Iniciando conversão ${job.original_name} → ${ext}`)

  try {
    // Executar conversão com LibreOffice
    await new Promise<void>((resolve, reject) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(`LibreOffice stderr: ${stderr}`)
          return reject(err)
        }
        resolve()
      })
    })

    // Verificar se arquivo foi criado
    const expectedOutput = path.join(outdir, `${path.basename(job.file_path, path.extname(job.file_path))}.${ext}`)
    if (fs.existsSync(expectedOutput)) {
      // Renomear para nome único
      fs.renameSync(expectedOutput, outputPath)
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error('Arquivo de saída não foi criado')
    }

    // Atualizar job no banco como concluído
    await jobsRepository.update(jobId, {
      status: 'done',
      download_path: outputPath,
      download_name: outputName
    })

    console.log(`✅ [${jobId}] Conversão concluída: ${outputName}`)

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    const newRetries = retries + 1
    console.error(`❌ [${jobId}] Erro: ${message} (tentativa ${newRetries}/${MAX_RETRIES})`)

    if (newRetries < MAX_RETRIES) {
      // Reinserir na fila para retry
      await redis.lpush(QUEUE_KEY, JSON.stringify({ jobId, retries: newRetries }))
      await jobsRepository.update(jobId, {
        status: 'pending',
        error_message: `Tentativa ${newRetries}: ${message}`
      })
      console.log(`🔄 [${jobId}] Reenfileirado para retry`)
    } else {
      // Falhou definitivamente
      await jobsRepository.update(jobId, {
        status: 'failed',
        error_message: `Falhou após ${MAX_RETRIES} tentativas: ${message}`
      })
      console.log(`🚫 [${jobId}] Falhou definitivamente após ${MAX_RETRIES} tentativas`)
    }
  }
}

async function listenQueue() {
  console.log('🚀 Worker de conversão iniciado e aguardando jobs...')
  console.log(`📊 Concorrência: ${CONCURRENCY} jobs simultâneos`)
  console.log(`🔁 Retries: até ${MAX_RETRIES} tentativas por job`)

  while (true) {
    try {
      // Bloqueia até aparecer um job na fila (BRPOP com timeout 0 = infinito)
      const result = await redis.brpop(QUEUE_KEY, 0)
      if (!result) continue

      const [, messageStr] = result
      const message: QueueMessage = JSON.parse(messageStr)
      const { jobId, retries = 0 } = message

      console.log(`📬 Recebido job ${jobId} da fila`)

      // Processar com limite de concorrência
      limit(() => runConversion(jobId, retries)).catch((err) => {
        console.error(`❌ Erro não tratado no worker para job ${jobId}:`, err)
      })

    } catch (err) {
      console.error('❌ Erro crítico no worker:', err)
      // Aguarda 2s antes de tentar novamente para evitar loop infinito
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}

// Iniciar worker
listenQueue().catch((err) => {
  console.error('❌ Worker falhou ao iniciar:', err)
  process.exit(1)
})
