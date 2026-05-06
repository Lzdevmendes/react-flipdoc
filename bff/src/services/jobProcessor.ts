import fs from 'fs'
import path from 'path'
import { convertFile, getFileExtension } from './conversionService'
import type { Job, UpdateJobDto } from '../db/jobsRepository'

interface Repo {
  findById: (id: string) => Promise<Job | null>
  update: (id: string, data: UpdateJobDto) => Promise<Job | null>
}

export async function processJob(jobId: string, repo: Repo): Promise<void> {
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
    await convertFile({ inputPath: job.file_path, outputPath, sourceFormat, targetFormat })

    if (!fs.existsSync(outputPath)) {
      throw new Error('Arquivo de saída não foi criado')
    }

    await repo.update(jobId, {
      status: 'done',
      download_path: outputPath,
      download_name: outputName,
    })

    console.log(`✅ [${jobId}] Conversão concluída: ${outputName}`)
    console.log(`📥 Download: /api/jobs/${jobId}/download\n`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error(`❌ [${jobId}] Erro: ${message}`)
    await repo.update(jobId, {
      status: 'failed',
      error_message: message,
    })
  }
}
