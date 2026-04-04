import React, { useRef } from 'react'
import {
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material'
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

interface DropZoneProps {
  onFile: (f: File) => void
  disabled?: boolean
}

const FORMATS = ['PDF', 'DOCX', 'DOC', 'TXT', 'MD']

export default function DropZone({ onFile, disabled = false }: DropZoneProps) {
  const { ref, file, setFile, over } = useDragAndDrop()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      onFile(f)
    }
  }

  return (
    <Box
      ref={ref}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Área de upload — clique ou arraste um arquivo"
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      sx={{
        border: '1.5px dashed',
        borderColor: disabled ? '#D4D4D8' : over ? '#F97316' : '#D4D4D8',
        borderRadius: '14px',
        p: { xs: 4, sm: 5, md: 7 },
        bgcolor: disabled ? '#F4F4F5' : over ? '#FFF7ED' : '#FFFFFF',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'center',
        opacity: disabled ? 0.65 : 1,
        outline: 'none',
        '&:focus-visible': {
          boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.3)',
        },
        '&:hover': !disabled
          ? { borderColor: '#A1A1AA', bgcolor: '#FAFAF9' }
          : {},
      }}
    >
      <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center">
        {/* Ícone */}
        <Box
          sx={{
            width: { xs: 44, sm: 50, md: 56 },
            height: { xs: 44, sm: 50, md: 56 },
            borderRadius: '14px',
            bgcolor: over && !disabled ? '#FFF7ED' : '#F4F4F5',
            border: '1px solid',
            borderColor: over && !disabled ? '#FED7AA' : '#E4E4E7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {disabled ? (
            <CircularProgress size={22} sx={{ color: '#A1A1AA' }} />
          ) : (
            <CloudUploadIcon
              sx={{
                fontSize: { xs: 22, md: 26 },
                color: over ? '#F97316' : '#A1A1AA',
                transition: 'color 0.2s ease',
              }}
            />
          )}
        </Box>

        {/* Texto */}
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: '#18181B', mb: 0.5, fontSize: { xs: '0.9rem', md: '0.9375rem' } }}
          >
            {disabled ? 'Enviando arquivo...' : 'Solte seu documento aqui'}
          </Typography>
          {!disabled && (
            <Typography variant="body2" sx={{ color: '#71717A', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              ou clique para selecionar
            </Typography>
          )}
        </Box>

        {/* Botão */}
        {!disabled && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadIcon sx={{ fontSize: 15 }} />}
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
            sx={{
              borderColor: '#E4E4E7',
              color: '#18181B',
              fontSize: { xs: '0.8rem', sm: '0.8125rem' },
              px: { xs: 2, sm: 2.5 },
              py: 0.875,
              '&:hover': { borderColor: '#A1A1AA', bgcolor: '#F4F4F5' },
            }}
          >
            Selecionar arquivo
          </Button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".doc,.docx,.pdf,.md,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={disabled}
        />

        {/* Formatos suportados */}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="center">
          {FORMATS.map((fmt) => (
            <Chip
              key={fmt}
              label={fmt}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontFamily: '"JetBrains Mono", monospace',
                borderColor: '#E4E4E7',
                color: '#71717A',
                fontWeight: 500,
                mb: 0.5,
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
