import fs from 'fs'
import path from 'path'
import { jobsRepository } from '../db/jobsRepository'
import { inMemoryJobsRepository } from '../db/inMemoryRepository'
import { pool } from '../db/client'

const POLL_INTERVAL = 2000
let useInMemory = false

pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Worker MOCK conectado ao PostgreSQL')
    useInMemory = false
  })
  .catch(() => {
    console.log('⚠️ Worker MOCK usando armazenamento em memória')
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

  const targetMap: Record<string, string> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'doc',
    'txt': 'txt',
    'md': 'md',
    'odt': 'odt'
  }
  const ext = targetMap[job.target_format] || 'pdf'

  const baseName = path.basename(job.original_name, path.extname(job.original_name))
  const outputName = `${Date.now()}-${baseName}.${ext}`
  const outputPath = path.join(outdir, outputName)

  await repo.update(jobId, { status: 'processing' })
  console.log(`🎭 [MOCK] [${jobId}] Simulando conversão: ${job.original_name} → ${ext}`)

  try {
    console.log(`⏳ Aguardando 3 segundos para simular conversão...`)
    await new Promise(resolve => setTimeout(resolve, 3000))

    fs.copyFileSync(job.file_path, outputPath)
    console.log(`✅ Arquivo "convertido" (copiado): ${outputName}`)

    await repo.update(jobId, {
      status: 'done',
      download_path: outputPath,
      download_name: outputName
    })

    console.log(`✅ [MOCK] [${jobId}] Conversão SIMULADA concluída: ${outputName}`)
    console.log(`📥 Download disponível em: /api/jobs/${jobId}/download\n`)

  } catch (err: any) {
    console.error(`❌ [MOCK] [${jobId}] Erro na simulação: ${err.message}`)

    await repo.update(jobId, {
      status: 'failed',
      error_message: `Erro na simulação: ${err.message}`
    })
  }
}

async function pollJobs() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎭 MOCK WORKER - Simulação de Conversão')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  Este worker NÃO converte arquivos de verdade!')
  console.log('⚠️  Ele apenas COPIA o arquivo original como "convertido"')
  console.log('⚠️  Use para testar o fluxo sem instalar LibreOffice')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`⏱️  Intervalo de verificação: ${POLL_INTERVAL}ms`)
  console.log(`📋 Aguardando jobs pendentes...\n`)

  while (true) {
    try {
      const repo = getRepository()
      const allJobs = await repo.findAll(100, 0)
      const pendingJobs = allJobs.filter(job => job.status === 'pending')

      if (pendingJobs.length > 0) {
        console.log(`📬 Encontrados ${pendingJobs.length} job(s) pendente(s)`)

        for (const job of pendingJobs) {
          await processJob(job.id)
        }
      }

      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))

    } catch (err) {
      console.error('❌ Erro no worker:', err)
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Mock Worker encerrando...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Mock Worker encerrando...')
  process.exit(0)
})

pollJobs().catch((err) => {
  console.error('❌ Mock Worker falhou ao iniciar:', err)
  process.exit(1)
})
