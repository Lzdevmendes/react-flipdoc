import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { jobsRepository } from '../db/jobsRepository'
import { inMemoryJobsRepository } from '../db/inMemoryRepository'
import { pool } from '../db/client'

/**
 * Worker simplificado que funciona SEM Redis
 * Faz polling no banco de dados a cada 2 segundos
 */

const POLL_INTERVAL = 2000  // Verificar a cada 2 segundos
let useInMemory = false

// Verificar conexão do banco
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Worker conectado ao PostgreSQL')
    useInMemory = false
  })
  .catch(() => {
    console.log('⚠️ Worker usando armazenamento em memória')
    useInMemory = true
  })

const getRepository = () => {
  return useInMemory ? inMemoryJobsRepository : jobsRepository
}

async function processJob(jobId: string): Promise<void> {
  const repo = getRepository()
  const job = await repo.findById(jobId)

  if (!job) {
    console.error(`❌ Job ${jobId} não encontrado`)
    return
  }

  // Criar diretório de saída
  const outdir = path.join(__dirname, '..', '..', 'storage')
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true })

  // Determinar extensão de saída
  const targetMap: Record<string, string> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'doc',
    'txt': 'txt',
    'md': 'md',
    'odt': 'odt'
  }
  const ext = targetMap[job.target_format] || 'pdf'

  // Nome do arquivo de saída
  const baseName = path.basename(job.original_name, path.extname(job.original_name))
  const outputName = `${Date.now()}-${baseName}.${ext}`
  const outputPath = path.join(outdir, outputName)

  // Atualizar status para "processing"
  await repo.update(jobId, { status: 'processing' })
  console.log(`🟡 [${jobId}] Processando: ${job.original_name} → ${ext}`)

  try {
    // Comando LibreOffice
    const cmd = `libreoffice --headless --convert-to ${ext} --outdir "${outdir}" "${job.file_path}"`

    console.log(`🔧 Executando: ${cmd}`)

    // Executar conversão
    await new Promise<void>((resolve, reject) => {
      exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ LibreOffice error: ${err.message}`)
          console.error(`Stderr: ${stderr}`)
          return reject(new Error(`LibreOffice failed: ${err.message}`))
        }
        console.log(`📄 LibreOffice stdout: ${stdout}`)
        resolve()
      })
    })

    // LibreOffice cria arquivo com nome original, precisamos renomear
    const expectedOutput = path.join(outdir, `${path.basename(job.file_path, path.extname(job.file_path))}.${ext}`)

    if (fs.existsSync(expectedOutput)) {
      // Renomear para nome único
      fs.renameSync(expectedOutput, outputPath)
      console.log(`✅ Arquivo renomeado: ${outputName}`)
    } else {
      throw new Error(`Arquivo de saída não encontrado: ${expectedOutput}`)
    }

    // Verificar se arquivo existe
    if (!fs.existsSync(outputPath)) {
      throw new Error('Arquivo de saída não foi criado após conversão')
    }

    // Atualizar job como concluído
    await repo.update(jobId, {
      status: 'done',
      download_path: outputPath,
      download_name: outputName
    })

    console.log(`✅ [${jobId}] Conversão concluída: ${outputName}`)

  } catch (err: any) {
    console.error(`❌ [${jobId}] Erro na conversão: ${err.message}`)

    await repo.update(jobId, {
      status: 'failed',
      error_message: err.message || 'Erro desconhecido na conversão'
    })
  }
}

async function pollJobs() {
  console.log('🚀 Worker Simples iniciado (modo polling)')
  console.log(`⏱️ Intervalo de verificação: ${POLL_INTERVAL}ms`)
  console.log('📋 Aguardando jobs pendentes...\n')

  while (true) {
    try {
      const repo = getRepository()

      // Buscar todos os jobs
      const allJobs = await repo.findAll(100, 0)

      // Filtrar apenas jobs pendentes
      const pendingJobs = allJobs.filter(job => job.status === 'pending')

      if (pendingJobs.length > 0) {
        console.log(`📬 Encontrados ${pendingJobs.length} job(s) pendente(s)`)

        for (const job of pendingJobs) {
          await processJob(job.id)
        }
      }

      // Aguardar antes de próxima verificação
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))

    } catch (err) {
      console.error('❌ Erro no worker:', err)
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Worker encerrando...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Worker encerrando...')
  process.exit(0)
})

// Iniciar worker
pollJobs().catch((err) => {
  console.error('❌ Worker falhou ao iniciar:', err)
  process.exit(1)
})
