import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Chip,
  Stack,
  Divider,
} from '@mui/material'
import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  East as ArrowIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material'
import DropZone from '../components/DropZone'
import FormatSelector, { TargetFormat } from '../components/FormatSelector'
import { useConversion } from '../hooks/useConversion'
import { usePolling } from '../hooks/usePolling'

const formatColors: Record<string, string> = {
  pdf:  '#DC2626',
  docx: '#2563EB',
  doc:  '#2563EB',
  md:   '#7C3AED',
  txt:  '#059669',
  odt:  '#D97706',
}

function getExt(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Indicador de etapas ───────────────────────────────────────────────────────

type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

function StepIndicator({ status }: { status: JobStatus | null }) {
  const steps = [
    { label: 'Enviado' },
    { label: 'Processando' },
    { label: status === 'failed' ? 'Falhou' : 'Concluído' },
  ]

  const stepIndex =
    status === 'pending'    ? 0 :
    status === 'processing' ? 1 :
    status === 'done' || status === 'failed' ? 2 : 0

  const isFailed = status === 'failed'

  return (
    <Stack direction="row" alignItems="flex-start" sx={{ mb: { xs: 2.5, sm: 3 } }}>
      {steps.map((step, i) => {
        const completed = i < stepIndex || (i === stepIndex && (status === 'done' || status === 'failed'))
        const current   = i === stepIndex && status !== 'done' && status !== 'failed'
        const failed    = isFailed && i === 2

        const accent    = failed ? '#DC2626' : '#F97316'
        const dotColor  = failed ? '#DC2626' : (completed || current) ? '#F97316' : '#D4D4D8'
        const lineColor = i < stepIndex ? '#F97316' : '#E4E4E7'

        return (
          <React.Fragment key={step.label}>
            <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 64 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: failed ? '#FEE2E2' : (completed || current) ? '#FFF7ED' : '#F4F4F5',
                  border: '2px solid',
                  borderColor: dotColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  animation: current ? 'pulse 1.6s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }}
              >
                {failed && <CloseIcon sx={{ fontSize: 13, color: '#DC2626' }} />}
                {!failed && completed && <TaskAltIcon sx={{ fontSize: 14, color: '#F97316' }} />}
                {!failed && !completed && current && (
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#F97316' }} />
                )}
                {!failed && !completed && !current && (
                  <Typography sx={{ fontSize: '0.68rem', color: '#A1A1AA', fontWeight: 700, lineHeight: 1 }}>
                    {i + 1}
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  fontWeight: (completed || current) ? 600 : 400,
                  color: failed ? '#DC2626' : (completed || current) ? accent : '#A1A1AA',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                  textAlign: 'center',
                }}
              >
                {step.label}
              </Typography>
            </Stack>

            {i < steps.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  bgcolor: lineColor,
                  mt: '14px',
                  mx: 0.5,
                  transition: 'background-color 0.4s ease',
                  borderRadius: 1,
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </Stack>
  )
}

// ── Badge de formato ──────────────────────────────────────────────────────────

function FileFormatBadge({ label, ext }: { label: string; ext: string }) {
  const color = formatColors[ext] || '#6B7280'
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 1, sm: 1.5 },
        borderRadius: '10px',
        border: '1.5px solid',
        borderColor: `${color}40`,
        bgcolor: `${color}08`,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: { xs: 64, sm: 80 },
        gap: 0.25,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: { xs: '0.58rem', sm: '0.62rem' },
          color: `${color}99`,
          letterSpacing: '0.06em',
          lineHeight: 1,
        }}
      >
        {`.${ext}`}
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1rem', sm: '1.125rem' },
          color,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function UploadPage() {
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('pdf')
  const [selectedFile, setSelectedFile]  = useState<File | null>(null)
  const { jobId, status, error, isUploading, startConversion, checkStatus, reset } = useConversion()

  usePolling(
    async () => {
      if (jobId && status !== 'done' && status !== 'failed') await checkStatus()
    },
    800,
    !!jobId && status !== 'done' && status !== 'failed'
  )

  const handleFileSelect    = (file: File) => setSelectedFile(file)
  const handleConvert       = () => { if (selectedFile) startConversion(selectedFile, targetFormat) }
  const handleReset         = () => setSelectedFile(null)
  const handleNewConversion = () => { reset(); setSelectedFile(null) }

  const srcExt   = selectedFile ? getExt(selectedFile.name) : ''
  const srcLabel = srcExt.toUpperCase()

  return (
    <Box sx={{ maxWidth: { xs: '100%', md: 680 }, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h2"
          sx={{ mb: 0.75, color: '#18181B', fontSize: { xs: '1.4rem', sm: '1.65rem', md: '1.875rem' } }}
        >
          Converter documento
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#71717A', fontSize: { xs: '0.85rem', md: '0.9rem' }, lineHeight: 1.6 }}
        >
          Transforme arquivos entre PDF, DOCX, Markdown e outros formatos.
        </Typography>
      </Box>

      {/* Seletor de formato (antes de selecionar arquivo) */}
      {!jobId && !selectedFile && (
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1.25,
              color: '#A1A1AA',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.65rem',
            }}
          >
            Converter para
          </Typography>
          <FormatSelector
            value={targetFormat}
            onChange={setTargetFormat}
            disabled={isUploading || !!jobId}
          />
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
          sx={{
            border: '1px solid #E4E4E7',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Barra do arquivo */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.25, sm: 1.75 },
              bgcolor: '#F9F9F9',
              borderBottom: '1px solid #F0F0F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ overflow: 'hidden', flex: 1 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: formatColors[srcExt] || '#A1A1AA',
                  flexShrink: 0,
                  boxShadow: `0 0 0 3px ${(formatColors[srcExt] || '#A1A1AA')}22`,
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
                  flex: 1,
                }}
              >
                {selectedFile.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: '#A1A1AA',
                  fontFamily: '"JetBrains Mono", monospace',
                  flexShrink: 0,
                }}
              >
                {formatBytes(selectedFile.size)}
              </Typography>
            </Stack>
            <Button
              size="small"
              onClick={handleReset}
              disabled={isUploading}
              sx={{
                color: '#71717A',
                fontSize: '0.75rem',
                px: 1.25,
                py: 0.5,
                flexShrink: 0,
                minHeight: 30,
                ml: 1,
                '&:hover': { bgcolor: '#F0F0F0', color: '#18181B' },
              }}
            >
              Trocar
            </Button>
          </Box>

          {/* Conteúdo */}
          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: { xs: 3, sm: 4 } }}>

            {/* Preview de conversão */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
                mb: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
              }}
            >
              <FileFormatBadge label={srcLabel} ext={srcExt} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <ArrowIcon
                  sx={{
                    color: '#D4D4D8',
                    fontSize: { xs: 20, sm: 24 },
                    animation: 'none',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    color: '#D4D4D8',
                    fontFamily: '"JetBrains Mono", monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  para
                </Typography>
              </Box>
              <FileFormatBadge label={targetFormat.toUpperCase()} ext={targetFormat} />
            </Box>

            <Divider sx={{ mb: { xs: 2.5, sm: 3 }, borderColor: '#F4F4F5' }} />

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1.25,
                color: '#A1A1AA',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.65rem',
              }}
            >
              Alterar formato de destino
            </Typography>
            <FormatSelector value={targetFormat} onChange={setTargetFormat} disabled={isUploading} />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleConvert}
              disabled={isUploading}
              sx={{
                mt: { xs: 3, sm: 3.5 },
                py: { xs: 1.375, sm: 1.625 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 700,
                bgcolor: '#1A1A2E',
                borderRadius: '12px',
                letterSpacing: '-0.01em',
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
            border: '1.5px solid',
            borderColor:
              status === 'done'   ? '#86EFAC' :
              status === 'failed' ? '#FCA5A5' : '#E4E4E7',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Header com status */}
          <Box
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.75, sm: 2.25 },
              bgcolor:
                status === 'done'   ? '#F0FDF4' :
                status === 'failed' ? '#FEF2F2' : '#F9F9F9',
              borderBottom: '1px solid',
              borderColor:
                status === 'done'   ? '#BBF7D0' :
                status === 'failed' ? '#FECACA' : '#F0F0F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              {status === 'done' ? (
                <CheckIcon sx={{ fontSize: 20, color: '#16A34A' }} />
              ) : status === 'failed' ? (
                <ErrorIcon sx={{ fontSize: 20, color: '#DC2626' }} />
              ) : (
                <Stack direction="row" spacing={0.4} alignItems="center">
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 5, height: 5, borderRadius: '50%',
                        bgcolor: status === 'processing' ? '#F97316' : '#A1A1AA',
                        animation: 'dotPulse 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </Stack>
              )}
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    color:
                      status === 'done'   ? '#15803D' :
                      status === 'failed' ? '#DC2626' : '#18181B',
                    lineHeight: 1.2,
                  }}
                >
                  {status === 'done'       ? 'Conversão concluída'  :
                   status === 'failed'     ? 'Falha na conversão'    :
                   status === 'processing' ? 'Processando arquivo...' : 'Aguardando na fila...'}
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={status}
              size="small"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.65rem',
                height: 20,
                bgcolor:
                  status === 'done'   ? '#DCFCE7' :
                  status === 'failed' ? '#FEE2E2' : '#EDEDED',
                color:
                  status === 'done'   ? '#15803D' :
                  status === 'failed' ? '#DC2626'  : '#71717A',
                border: 'none',
                fontWeight: 700,
              }}
            />
          </Box>

          {/* Corpo */}
          <Box sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 2.5, sm: 3.5 } }}>

            {/* Indicador de etapas */}
            <StepIndicator status={status} />

            {/* Alert sucesso */}
            {status === 'done' && (
              <Alert
                severity="success"
                icon={<CheckIcon fontSize="small" />}
                sx={{
                  mb: { xs: 2, sm: 2.5 },
                  borderRadius: '10px',
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
                  borderRadius: '10px',
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
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderColor: '#FECACA',
                  color: '#DC2626',
                  borderRadius: '12px',
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
                    py: { xs: 1.375, sm: 1.625 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    fontWeight: 700,
                    bgcolor: '#16A34A',
                    borderRadius: '12px',
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
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderColor: '#E4E4E7',
                    color: '#71717A',
                    borderRadius: '12px',
                    '&:hover': { borderColor: '#A1A1AA', bgcolor: '#F9F9F9', color: '#18181B' },
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
