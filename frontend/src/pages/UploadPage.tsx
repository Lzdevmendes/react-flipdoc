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
  Pending as PendingIcon
} from '@mui/icons-material'
import DropZone from '../components/DropZone'
import FormatSelector, { TargetFormat } from '../components/FormatSelector'
import { useConversion } from '../hooks/useConversion'
import { usePolling } from '../hooks/usePolling'

export default function UploadPage() {
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('pdf')
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

      {/* Seletor de Formato */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Formato de Destino
        </Typography>
        <FormatSelector
          value={targetFormat}
          onChange={setTargetFormat}
          disabled={!!jobId && status !== 'done' && status !== 'failed'}
        />
      </Paper>

      {/* Área de Upload */}
      <DropZone
        onFile={(file) => startConversion(file, targetFormat)}
      />

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
