import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { jobsRepository } from '../db/jobsRepository'
import { inMemoryJobsRepository } from '../db/inMemoryRepository'
import { redis } from '../redis/client'
import { validateFile } from '../middlewares/fileValidation'

// Usar repositório em memória se PostgreSQL não estiver disponível
let useInMemory = false

// Helper para obter o repositório correto
const getRepository = () => {
  return useInMemory ? inMemoryJobsRepository : jobsRepository
}

// Verificar conexão do banco na inicialização
import { pool } from '../db/client'
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ PostgreSQL conectado - usando banco de dados')
    useInMemory = false
  })
  .catch(() => {
    console.log('⚠️ PostgreSQL não disponível - usando armazenamento em memória')
    useInMemory = true
  })

// Nome da fila Redis
const QUEUE_KEY = 'convert:queue'

// Storage temporário local
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR) },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
})
const upload = multer({ storage })

const router = express.Router()

/**
 * POST /api/convert
 * Upload de arquivo e criação de job de conversão
 */
router.post('/convert', upload.single('file'), validateFile, async (req, res) => {
  try {
    const file = req.file
    const target = req.body.target || 'pdf'

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const jobId = uuidv4()

    // Criar job no banco de dados ou em memória
    const repo = getRepository()
    const job = await repo.create({
      id: jobId,
      original_name: file.originalname,
      file_path: file.path,
      target_format: target
    })

    console.log(`✅ Job criado: ${jobId} - ${file.originalname} → ${target}`)

    // Tentar adicionar job à fila Redis (se disponível)
    try {
      await redis.lpush(QUEUE_KEY, JSON.stringify({ jobId }))
      console.log(`📬 Job ${jobId} adicionado à fila Redis`)
    } catch (redisError) {
      // Redis não disponível - worker simples vai processar via polling
      console.log(`⚠️ Redis não disponível - job será processado via polling`)
    }

    return res.json({ jobId: job.id })
  } catch (error) {
    console.error('❌ Erro ao criar job:', error)
    return res.status(500).json({ error: 'Failed to create conversion job' })
  }
})

/**
 * GET /api/jobs/:id/status
 * Consultar status de um job específico
 */
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
    console.error('❌ Erro ao buscar status do job:', error)
    return res.status(500).json({ error: 'Failed to fetch job status' })
  }
})

/**
 * GET /api/jobs
 * Listar todos os jobs (com paginação)
 */
router.get('/jobs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100
    const offset = parseInt(req.query.offset as string) || 0

    const repo = getRepository()
    const jobs = await repo.findAll(limit, offset)
    const total = await repo.count()

    return res.json({
      jobs,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('❌ Erro ao listar jobs:', error)
    return res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

/**
 * GET /api/jobs/:id/download
 * Download do arquivo convertido
 */
router.get('/jobs/:id/download', async (req, res) => {
  try {
    const repo = getRepository()
    const job = await repo.findById(req.params.id)

    if (!job) {
      return res.status(404).send('Job not found')
    }

    if (job.status !== 'done') {
      return res.status(400).send('Conversion not completed yet')
    }

    if (!job.download_path || !job.download_name) {
      return res.status(500).send('Download file not available')
    }

    return res.download(job.download_path, job.download_name)
  } catch (error) {
    console.error('❌ Erro ao fazer download:', error)
    return res.status(500).send('Failed to download file')
  }
})

/**
 * PATCH /api/jobs/:id
 * Atualizar status de um job (usado pelo worker)
 */
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

    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' })
    }

    return res.json(updatedJob)
  } catch (error) {
    console.error('❌ Erro ao atualizar job:', error)
    return res.status(500).json({ error: 'Failed to update job' })
  }
})

export default router
