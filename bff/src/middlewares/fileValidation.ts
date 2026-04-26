import { Request, Response, NextFunction } from 'express'
import path from 'path'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MIN_FILE_SIZE = 100 // 100 bytes

// MIME types permitidos
const ALLOWED_MIME_TYPES = [
  // PDF
  'application/pdf',
  // Microsoft Word
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  // Texto
  'text/plain', // .txt
  'text/markdown', // .md
  // OpenDocument
  'application/vnd.oasis.opendocument.text', // .odt
]

// Extensões permitidas
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.md',
  '.odt',
]

interface ValidationError {
  field: string
  message: string
  details?: any
}

/**
 * Middleware para validar arquivo enviado
 */
export function validateFile(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = []

  // Verificar se arquivo existe
  if (!req.file) {
    return res.status(400).json({
      error: 'No file provided',
      message: 'Por favor, selecione um arquivo para fazer upload.'
    })
  }

  const file = req.file

  // 1. Validar tamanho do arquivo
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      field: 'size',
      message: `Arquivo muito grande. Tamanho máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      details: {
        fileSize: file.size,
        maxSize: MAX_FILE_SIZE,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
        maxSizeMB: MAX_FILE_SIZE / 1024 / 1024
      }
    })
  }

  if (file.size < MIN_FILE_SIZE) {
    errors.push({
      field: 'size',
      message: 'Arquivo muito pequeno ou vazio',
      details: {
        fileSize: file.size,
        minSize: MIN_FILE_SIZE
      }
    })
  }

  // 2. Validar MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    errors.push({
      field: 'mimetype',
      message: 'Tipo de arquivo não suportado',
      details: {
        receivedType: file.mimetype,
        allowedTypes: ALLOWED_MIME_TYPES
      }
    })
  }

  // 3. Validar extensão do arquivo
  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push({
      field: 'extension',
      message: `Extensão de arquivo não permitida: ${ext}`,
      details: {
        receivedExtension: ext,
        allowedExtensions: ALLOWED_EXTENSIONS
      }
    })
  }

  // 4. Validar nome do arquivo (segurança)
  const unsafeCharacters = /[<>:"\/\\|?*\x00-\x1F]/g
  if (unsafeCharacters.test(file.originalname)) {
    errors.push({
      field: 'filename',
      message: 'Nome do arquivo contém caracteres inválidos',
      details: {
        filename: file.originalname
      }
    })
  }

  // 5. Validar formato de destino
  const targetFormat = req.body.target
  const validTargetFormats = ['pdf', 'docx', 'txt', 'md', 'odt']

  if (targetFormat && !validTargetFormats.includes(targetFormat)) {
    errors.push({
      field: 'target',
      message: `Formato de destino inválido: ${targetFormat}`,
      details: {
        receivedFormat: targetFormat,
        allowedFormats: validTargetFormats
      }
    })
  }

  // Se houver erros, retornar resposta 400
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'File validation failed',
      message: 'Arquivo não passou nas validações',
      errors: errors,
      file: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      }
    })
  }

  // Se passou em todas validações, continuar
  console.log(`✅ Arquivo validado: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`)
  next()
}

/**
 * Middleware para validar múltiplos arquivos (uso futuro)
 */
export function validateFiles(req: Request, res: Response, next: NextFunction) {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({
      error: 'No files provided',
      message: 'Por favor, selecione pelo menos um arquivo.'
    })
  }

  // Validar cada arquivo individualmente
  const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat()

  for (const file of files) {
    req.file = file as Express.Multer.File
    validateFile(req, res, () => {})
  }

  next()
}
