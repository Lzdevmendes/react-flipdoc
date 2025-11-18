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
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Converter Documentos
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Faça upload de seus documentos e converta entre PDF, DOCX e outros formatos
      </Typography>

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
        <Card sx={{ mb: 3 }}>
          <CardContent>
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
                  p: 3,
                  bgcolor: 'primary.50',
                  border: '2px solid',
                  borderColor: 'primary.200'
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                  <Chip
                    label={getFileFormat(selectedFile.name)}
                    color="primary"
                    size="medium"
                    sx={{ fontSize: '1rem', fontWeight: 600, px: 2, py: 2.5 }}
                  />
                  <TransformIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Chip
                    label={targetFormat.toUpperCase()}
                    color="secondary"
                    size="medium"
                    sx={{ fontSize: '1rem', fontWeight: 600, px: 2, py: 2.5 }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={2}>
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
                sx={{ py: 1.5, fontSize: '1rem' }}
              >
                {isUploading ? 'Iniciando conversão...' : 'Converter Arquivo'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Status da Conversão */}
      {jobId && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Status da Conversão
                </Typography>
                <Chip
                  label={status}
                  color={getStatusColor() as any}
                  icon={getStatusIcon()}
                  size="medium"
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Job ID
                </Typography>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {jobId}
                </Typography>
              </Box>

              {(status === 'processing' || status === 'pending') && (
                <Box>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Processando seu documento...
                  </Typography>
                </Box>
              )}

              {status === 'done' && (
                <Alert severity="success" icon={<CheckIcon />}>
                  Conversão concluída com sucesso!
                </Alert>
              )}

              {error && (
                <Alert severity="error" icon={<ErrorIcon />}>
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
                  >
                    Baixar arquivo convertido
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => window.location.reload()}
                    fullWidth
                  >
                    Converter outro arquivo
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
