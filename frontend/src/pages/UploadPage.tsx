import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  LinearProgress,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Transform as TransformIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material'
import DropZone from '../components/DropZone'
import FormatSelector, { TargetFormat } from '../components/FormatSelector'
import { useConversion } from '../hooks/useConversion'
import { usePolling } from '../hooks/usePolling'

export default function UploadPage() {
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('pdf')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { jobId, status, error, isUploading, startConversion, checkStatus } = useConversion()

  usePolling(
    async () => {
      if (jobId && status !== 'done' && status !== 'failed')
        await checkStatus()
    },
    2000,
    !!jobId && status !== 'done' && status !== 'failed'
  )

  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    return ext
  }

  const getFileFormat = (filename: string): string => {
    const ext = getFileExtension(filename)
    const formatMap: Record<string, string> = {
      'pdf': 'PDF',
      'doc': 'DOC',
      'docx': 'DOCX',
      'txt': 'TXT',
      'md': 'Markdown',
      'odt': 'ODT'
    }
    return formatMap[ext] || ext.toUpperCase()
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleConvert = () => {
    if (selectedFile) {
      startConversion(selectedFile, targetFormat)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
  }

  const getStatusColor = () => {
    switch (status) {
      case 'done': return 'success'
      case 'failed': return 'error'
      case 'processing': return 'info'
      default: return 'default'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'done': return <CheckIcon />
      case 'failed': return <ErrorIcon />
      case 'processing': return <PendingIcon />
      default: return <PendingIcon />
    }
  }

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Typography variant="h3" gutterBottom fontWeight={800}>
          ✨ Conversor de Documentos
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95 }}>
          Transforme seus arquivos entre PDF, DOCX, TXT e outros formatos em segundos
        </Typography>
      </Box>

      {/* Seletor de Formato */}
      {!selectedFile && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Formato de Destino
          </Typography>
          <FormatSelector
            value={targetFormat}
            onChange={setTargetFormat}
            disabled={isUploading || !!jobId}
          />
        </Paper>
      )}

      {/* Área de Upload */}
      {!selectedFile && !jobId && (
        <DropZone
          onFile={handleFileSelect}
          disabled={isUploading}
        />
      )}

      {/* Preview do Arquivo Selecionado */}
      {selectedFile && !jobId && (
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  Arquivo Selecionado
                </Typography>
                <Button size="small" onClick={handleReset} disabled={isUploading}>
                  Escolher outro arquivo
                </Button>
              </Box>

              <Divider />

              {/* Informações do Arquivo */}
              <Stack direction="row" spacing={2} alignItems="center">
                <FileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Stack>

              {/* Conversão: Origem → Destino */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '3px solid',
                  borderColor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                }}
              >
                <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                  <Chip
                    label={getFileFormat(selectedFile.name)}
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      px: 3,
                      py: 3,
                      bgcolor: 'white',
                      color: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <TransformIcon sx={{ fontSize: 48, color: 'white', animation: 'pulse 2s infinite' }} />
                  <Chip
                    label={targetFormat.toUpperCase()}
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      px: 3,
                      py: 3,
                      bgcolor: 'white',
                      color: 'secondary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                </Stack>
                <Typography
                  variant="body1"
                  textAlign="center"
                  display="block"
                  mt={2}
                  sx={{ color: 'white', fontWeight: 500 }}
                >
                  Converter de {getFileFormat(selectedFile.name)} para {targetFormat.toUpperCase()}
                </Typography>
              </Paper>

              {/* Seletor de Formato (editar antes de converter) */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Alterar formato de destino (opcional)
                </Typography>
                <FormatSelector
                  value={targetFormat}
                  onChange={setTargetFormat}
                  disabled={isUploading}
                />
              </Box>

              {/* Botão de Conversão */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<TransformIcon />}
                onClick={handleConvert}
                disabled={isUploading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {isUploading ? 'Iniciando conversão...' : '🚀 Converter Arquivo Agora'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Status da Conversão */}
      {jobId && (
        <Card
          sx={{
            mt: 3,
            background: status === 'done'
              ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
              : status === 'failed'
              ? 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            borderRadius: 3,
            animation: 'slideInUp 0.6s ease-out',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                  {status === 'done' ? '✅ Conversão Concluída!' :
                   status === 'failed' ? '❌ Conversão Falhou' :
                   '⚙️ Processando Conversão'}
                </Typography>
                <Chip
                  label={status === 'done' ? 'Concluído' :
                         status === 'failed' ? 'Falhou' :
                         status === 'processing' ? 'Processando' : 'Pendente'}
                  icon={getStatusIcon()}
                  sx={{
                    bgcolor: 'white',
                    color: status === 'done' ? '#11998e' :
                           status === 'failed' ? '#eb3349' : '#667eea',
                    fontWeight: 700,
                    px: 2,
                    py: 2.5,
                  }}
                />
              </Box>

              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  ID da Conversão
                </Typography>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{
                    wordBreak: 'break-all',
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    p: 1,
                    borderRadius: 1,
                    mt: 0.5,
                  }}
                >
                  {jobId}
                </Typography>
              </Box>

              {(status === 'processing' || status === 'pending') && (
                <Box>
                  <LinearProgress
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                      display: 'block',
                      color: 'white',
                      fontWeight: 500,
                      textAlign: 'center',
                    }}
                  >
                    ⏳ Convertendo seu documento... Aguarde alguns segundos
                  </Typography>
                </Box>
              )}

              {status === 'done' && (
                <Alert
                  severity="success"
                  icon={<CheckIcon />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.95)',
                    fontWeight: 600,
                  }}
                >
                  Seu arquivo foi convertido com sucesso e está pronto para download!
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  icon={<ErrorIcon />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.95)',
                    fontWeight: 600,
                  }}
                >
                  {error}
                </Alert>
              )}

              {status === 'done' && jobId && (
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    href={`/api/jobs/${jobId}/download`}
                    fullWidth
                    sx={{
                      bgcolor: 'white',
                      color: '#11998e',
                      fontWeight: 700,
                      py: 2,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    📥 Baixar Arquivo Convertido
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => window.location.reload()}
                    fullWidth
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    🔄 Converter Outro Arquivo
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
