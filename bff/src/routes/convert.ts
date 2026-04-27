import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { jobsRepository } from '../db/jobsRepository'
import { inMemoryJobsRepository } from '../db/inMemoryRepository'
import { validateFile } from '../middlewares/fileValidation'
import { pool } from '../db/client'
import { processJob } from '../services/jobProcessor'

let useInMemory = false

const getRepository = () => {
  return useInMemory ? inMemoryJobsRepository : jobsRepository
}

pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ PostgreSQL conectado')
    useInMemory = false
  })
  .catch(() => {
    console.log('⚠️ PostgreSQL indisponível - usando memória')
    useInMemory = true
  })

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })
const router = express.Router()

router.post('/convert', upload.single('file'), validateFile, async (req, res) => {
  try {
    const file = req.file
    const target = req.body.target || 'pdf'

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const jobId = uuidv4()
    const repo = getRepository()
    const job = await repo.create({
      id: jobId,
      original_name: file.originalname,
      file_path: file.path,
      target_format: target
    })

    console.log(`✅ Job criado: ${jobId} - ${file.originalname} → ${target}`)

    // Processa em background sem bloquear a resposta
    setImmediate(() => processJob(jobId, repo).catch(console.error))

    return res.json({ jobId: job.id })
  } catch (error) {
    console.error('❌ Erro:', error)
    return res.status(500).json({ error: 'Failed to create job' })
  }
})

router.get('/jobs/:id/status', async (req, res) => {
  try {
    const repo = getRepository()
    const job = await repo.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    return res.json({
      status: job.status,
      downloadUrl: job.download_path ? `/api/jobs/${job.id}/download` : null
    })
  } catch (error) {
    console.error('❌ Erro:', error)
    return res.status(500).json({ error: 'Failed to fetch status' })
  }
})

router.get('/jobs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100
    const offset = parseInt(req.query.offset as string) || 0

    const repo = getRepository()
    const jobs = await repo.findAll(limit, offset)
    const total = await repo.count()

    return res.json({ jobs, total, limit, offset })
  } catch (error) {
    console.error('❌ Erro:', error)
    return res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

router.get('/jobs/:id/download', async (req, res) => {
  try {
    const repo = getRepository()
    const job = await repo.findById(req.params.id)

    if (!job) return res.status(404).send('Job not found')
    if (job.status !== 'done') return res.status(400).send('Not completed')
    if (!job.download_path || !job.download_name) return res.status(500).send('File unavailable')

    return res.download(job.download_path, job.download_name)
  } catch (error) {
    console.error('❌ Erro:', error)
    return res.status(500).send('Failed to download')
  }
})

router.patch('/jobs/:id', async (req, res) => {
  try {
    const { status, download_path, download_name, error_message } = req.body
    const repo = getRepository()
    const updatedJob = await repo.update(req.params.id, {
      status,
      download_path,
      download_name,
      error_message
    })

    if (!updatedJob) return res.status(404).json({ error: 'Job not found' })
    return res.json(updatedJob)
  } catch (error) {
    console.error('❌ Erro:', error)
    return res.status(500).json({ error: 'Failed to update' })
  }
})

export default router
