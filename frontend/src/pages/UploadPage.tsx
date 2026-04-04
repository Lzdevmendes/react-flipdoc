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
  Divider,
} from '@mui/material'
import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import DropZone from '../components/DropZone'
import FormatSelector, { TargetFormat } from '../components/FormatSelector'
import { useConversion } from '../hooks/useConversion'
import { usePolling } from '../hooks/usePolling'

const formatColors: Record<string, string> = {
  pdf: '#DC2626',
  docx: '#2563EB',
  doc: '#2563EB',
  md: '#7C3AED',
  txt: '#059669',
  odt: '#D97706',
}

function getExt(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function FileFormatBadge({ label, ext }: { label: string; ext: string }) {
  const color = formatColors[ext] || '#6B7280'
  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 0.75, sm: 1 },
        borderRadius: '8px',
        border: '1.5px solid',
        borderColor: color,
        bgcolor: `${color}12`,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: { xs: 56, sm: 72 },
      }}
    >
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: { xs: '0.6rem', sm: '0.65rem' },
          color,
          opacity: 0.75,
          letterSpacing: '0.06em',
        }}
      >
        {`.${ext}`}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem' }, color, lineHeight: 1.3 }}>
        {label}
      </Typography>
    </Box>
  )
}

export default function UploadPage() {
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('pdf')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { jobId, status, error, isUploading, startConversion, checkStatus, reset } = useConversion()

  usePolling(
    async () => {
      if (jobId && status !== 'done' && status !== 'failed') await checkStatus()
    },
    800,
    !!jobId && status !== 'done' && status !== 'failed'
  )

  const handleFileSelect = (file: File) => setSelectedFile(file)
  const handleConvert = () => { if (selectedFile) startConversion(selectedFile, targetFormat) }
  const handleReset = () => setSelectedFile(null)
  const handleNewConversion = () => { reset(); setSelectedFile(null) }

  const srcExt = selectedFile ? getExt(selectedFile.name) : ''
  const srcLabel = srcExt.toUpperCase()

  return (
    <Box sx={{ maxWidth: { xs: '100%', md: 720 }, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 5 } }}>
        <Typography
          variant="h2"
          sx={{ mb: 1, color: '#18181B', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
        >
          Converter documento
        </Typography>
        <Typography variant="body1" sx={{ color: '#71717A', fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
          Transforme arquivos entre PDF, DOCX, Markdown e outros formatos.
        </Typography>
      </Box>

      {/* Formato de destino (antes de selecionar arquivo) */}
      {!jobId && (
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1.5,
              color: '#71717A',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
            }}
          >
            Converter para
          </Typography>
          <FormatSelector value={targetFormat} onChange={setTargetFormat} disabled={isUploading || !!jobId} />
        </Box>
      )}

      {/* Drop zone */}
      {!selectedFile && !jobId && (
        <DropZone onFile={handleFileSelect} disabled={isUploading} />
      )}

      {/* Arquivo selecionado */}
      {selectedFile && !jobId && (
        <Paper
          className="animate-slideInUp"
          elevation={0}
          sx={{ border: '1px solid #E4E4E7', borderRadius: '14px', overflow: 'hidden' }}
        >
          {/* Barra do arquivo */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              bgcolor: '#F9F9F9',
              borderBottom: '1px solid #E4E4E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ overflow: 'hidden', flex: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: formatColors[srcExt] || '#A1A1AA',
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  color: '#18181B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedFile.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#A1A1AA',
                  fontFamily: '"JetBrains Mono", monospace',
                  flexShrink: 0,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {(selectedFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Stack>
            <Button
              size="small"
              onClick={handleReset}
              disabled={isUploading}
              sx={{
                color: '#71717A',
                fontSize: '0.78rem',
                px: 1.5,
                py: 0.5,
                flexShrink: 0,
                minHeight: 32,
                '&:hover': { bgcolor: '#F4F4F5', color: '#18181B' },
              }}
            >
              Trocar
            </Button>
          </Box>

          {/* Conteúdo */}
          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3.5 } }}>
            {/* Badges de formato */}
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems="center"
              sx={{ mb: { xs: 2.5, sm: 3.5 } }}
            >
              <FileFormatBadge label={srcLabel} ext={srcExt} />
              <ArrowIcon sx={{ color: '#D4D4D8', fontSize: { xs: 18, sm: 22 }, flexShrink: 0 }} />
              <FileFormatBadge label={targetFormat.toUpperCase()} ext={targetFormat} />
            </Stack>

            <Divider sx={{ mb: { xs: 2.5, sm: 3 }, borderColor: '#F4F4F5' }} />

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1.5,
                color: '#71717A',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
              }}
            >
              Alterar destino
            </Typography>
            <FormatSelector value={targetFormat} onChange={setTargetFormat} disabled={isUploading} />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleConvert}
              disabled={isUploading}
              sx={{
                mt: { xs: 2.5, sm: 3.5 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                bgcolor: '#1A1A2E',
                borderRadius: '10px',
                '&:hover': { bgcolor: '#2D2D44' },
                '&.Mui-disabled': { bgcolor: '#E4E4E7', color: '#A1A1AA' },
              }}
            >
              {isUploading ? 'Iniciando conversão...' : 'Converter agora'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Status da conversão */}
      {jobId && (
        <Paper
          className="animate-slideInUp"
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: status === 'done' ? '#BBF7D0' : status === 'failed' ? '#FECACA' : '#E4E4E7',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {/* Header do status */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              bgcolor: status === 'done' ? '#F0FDF4' : status === 'failed' ? '#FEF2F2' : '#F9F9F9',
              borderBottom: '1px solid',
              borderColor: status === 'done' ? '#BBF7D0' : status === 'failed' ? '#FECACA' : '#E4E4E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {status === 'done' ? (
                <CheckIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              ) : status === 'failed' ? (
                <ErrorIcon sx={{ fontSize: 18, color: '#DC2626' }} />
              ) : (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: '#A1A1AA',
                        animation: 'dotPulse 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </Box>
              )}
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  color: status === 'done' ? '#15803D' : status === 'failed' ? '#DC2626' : '#18181B',
                }}
              >
                {status === 'done'
                  ? 'Conversão concluída'
                  : status === 'failed'
                  ? 'Conversão falhou'
                  : status === 'processing'
                  ? 'Processando...'
                  : 'Na fila...'}
              </Typography>
            </Stack>
            <Chip
              label={status}
              size="small"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.68rem',
                height: 22,
                bgcolor:
                  status === 'done' ? '#DCFCE7' : status === 'failed' ? '#FEE2E2' : '#F4F4F5',
                color:
                  status === 'done' ? '#15803D' : status === 'failed' ? '#DC2626' : '#71717A',
                border: 'none',
                fontWeight: 600,
              }}
            />
          </Box>

          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
            {/* Job ID */}
            <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 0.5,
                  color: '#A1A1AA',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.65rem',
                }}
              >
                ID da conversão
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: { xs: '0.72rem', sm: '0.78rem' },
                  color: '#71717A',
                  bgcolor: '#F4F4F5',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '6px',
                  wordBreak: 'break-all',
                }}
              >
                {jobId}
              </Typography>
            </Box>

            {/* Progress bar */}
            {(status === 'processing' || status === 'pending') && (
              <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
                <LinearProgress
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#F4F4F5',
                    '& .MuiLinearProgress-bar': { bgcolor: '#F97316', borderRadius: 2 },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ mt: 1.5, color: '#71717A', fontSize: { xs: '0.8rem', sm: '0.8125rem' } }}
                >
                  Convertendo seu documento, aguarde...
                </Typography>
              </Box>
            )}

            {/* Alert sucesso */}
            {status === 'done' && (
              <Alert
                severity="success"
                icon={<CheckIcon fontSize="small" />}
                sx={{
                  mb: { xs: 2, sm: 2.5 },
                  borderRadius: '8px',
                  bgcolor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  fontSize: { xs: '0.8rem', sm: '0.8125rem' },
                  '& .MuiAlert-icon': { color: '#16A34A' },
                }}
              >
                Arquivo convertido com sucesso e pronto para download.
              </Alert>
            )}

            {/* Alert erro */}
            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon fontSize="small" />}
                sx={{
                  mb: { xs: 2, sm: 2.5 },
                  borderRadius: '8px',
                  bgcolor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  fontSize: { xs: '0.8rem', sm: '0.8125rem' },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Ação: falha */}
            {status === 'failed' && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={handleNewConversion}
                fullWidth
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  borderColor: '#FECACA',
                  color: '#DC2626',
                  borderRadius: '10px',
                  '&:hover': { borderColor: '#DC2626', bgcolor: '#FEF2F2' },
                }}
              >
                Tentar novamente
              </Button>
            )}

            {/* Ações: sucesso */}
            {status === 'done' && jobId && (
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  href={`/api/jobs/${jobId}/download`}
                  fullWidth
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    bgcolor: '#16A34A',
                    borderRadius: '10px',
                    '&:hover': { bgcolor: '#15803D' },
                  }}
                >
                  Baixar arquivo convertido
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={handleNewConversion}
                  fullWidth
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '0.875rem' },
                    borderColor: '#E4E4E7',
                    color: '#18181B',
                    borderRadius: '10px',
                    '&:hover': { borderColor: '#A1A1AA', bgcolor: '#F9F9F9' },
                  }}
                >
                  Converter outro arquivo
                </Button>
              </Stack>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  )
}
