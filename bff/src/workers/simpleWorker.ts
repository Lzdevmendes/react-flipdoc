import fs from 'fs'
import path from 'path'
import { jobsRepository } from '../db/jobsRepository'
import { inMemoryJobsRepository } from '../db/inMemoryRepository'
import { pool } from '../db/client'
import { convertFile, getFileExtension } from '../services/conversionService'

const POLL_INTERVAL = 2000
let useInMemory = false

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

  const outdir = path.join(__dirname, '..', '..', 'storage')
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true })

  const sourceFormat = getFileExtension(job.original_name)
  const targetFormat = job.target_format

  const baseName = path.basename(job.original_name, path.extname(job.original_name))
  const outputName = `${Date.now()}-${baseName}.${targetFormat}`
  const outputPath = path.join(outdir, outputName)

  await repo.update(jobId, { status: 'processing' })
  console.log(`🔄 [${jobId}] Convertendo: ${job.original_name} (${sourceFormat} → ${targetFormat})`)

  try {
    await convertFile({
      inputPath: job.file_path,
      outputPath: outputPath,
      sourceFormat: sourceFormat,
      targetFormat: targetFormat
    })

    if (!fs.existsSync(outputPath)) {
      throw new Error('Arquivo de saída não foi criado')
    }

    await repo.update(jobId, {
      status: 'done',
      download_path: outputPath,
      download_name: outputName
    })

    console.log(`✅ [${jobId}] Conversão concluída: ${outputName}`)
    console.log(`📥 Download: /api/jobs/${jobId}/download\n`)

  } catch (err: any) {
    console.error(`❌ [${jobId}] Erro: ${err.message}`)

    await repo.update(jobId, {
      status: 'failed',
      error_message: err.message || 'Erro desconhecido'
    })
  }
}

async function pollJobs() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Worker de Conversão Iniciado')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`⏱️  Intervalo: ${POLL_INTERVAL}ms`)
  console.log(`📋 Aguardando jobs...\n`)

  while (true) {
    try {
      const repo = getRepository()
      const allJobs = await repo.findAll(100, 0)
      const pendingJobs = allJobs.filter(job => job.status === 'pending')

      if (pendingJobs.length > 0) {
        console.log(`📬 ${pendingJobs.length} job(s) pendente(s)`)

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
  console.log('\n👋 Worker encerrando...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Worker encerrando...')
  process.exit(0)
})

pollJobs().catch((err) => {
  console.error('❌ Worker falhou:', err)
  process.exit(1)
})
