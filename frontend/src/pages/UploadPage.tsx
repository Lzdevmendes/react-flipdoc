import React from 'react'
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
  Pending as PendingIcon
} from '@mui/icons-material'
import DropZone from '../components/DropZone'
import { useConversion } from '../hooks/useConversion'
import { usePolling } from '../hooks/usePolling'

export default function UploadPage() {
  const { jobId, status, error, startConversion, checkStatus } = useConversion()

  usePolling(
    async () => {
      if (jobId && status !== 'done' && status !== 'failed')
        await checkStatus()
    },
    2000,
    !!jobId && status !== 'done' && status !== 'failed'
  )

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

      <DropZone
        onFile={(file) => startConversion(
          file,
          file.name.endsWith('.pdf') ? 'docx' : 'pdf'
        )}
      />

      {/* Uploader Legado - SERÁ REMOVIDO NA SEMANA 3 */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
        <Typography variant="subtitle2" gutterBottom color="warning.dark">
          ⚠️ Uploader Legado (jQuery) - Será removido em breve
        </Typography>
        <LegacyUploader
          onFile={(file) => startConversion(
            file,
            file.name.endsWith('.pdf') ? 'docx' : 'pdf'
          )}
        />
      </Paper>

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
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  href={`/api/jobs/${jobId}/download`}
                  fullWidth
                >
                  Baixar arquivo convertido
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
