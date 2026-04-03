import React, { useRef } from 'react'
import {
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  CircularProgress
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
      sx={{
        border: '1.5px dashed',
        borderColor: disabled ? '#D4D4D8' : over ? '#F97316' : '#D4D4D8',
        borderRadius: '14px',
        p: 7,
        bgcolor: disabled
          ? '#F4F4F5'
          : over
          ? '#FFF7ED'
          : '#FFFFFF',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'center',
        opacity: disabled ? 0.65 : 1,
        '&:hover': !disabled ? {
          borderColor: '#A1A1AA',
          bgcolor: '#FAFAF9',
        } : {},
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            bgcolor: over && !disabled ? '#FFF7ED' : '#F4F4F5',
            border: '1px solid',
            borderColor: over && !disabled ? '#FED7AA' : '#E4E4E7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {disabled ? (
            <CircularProgress size={24} sx={{ color: '#A1A1AA' }} />
          ) : (
            <CloudUploadIcon
              sx={{
                fontSize: 26,
                color: over ? '#F97316' : '#A1A1AA',
                transition: 'color 0.2s ease',
              }}
            />
          )}
        </Box>

        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}
          >
            {disabled ? 'Enviando arquivo...' : 'Solte seu documento aqui'}
          </Typography>
          {!disabled && (
            <Typography variant="body2" sx={{ color: '#71717A' }}>
              ou clique para selecionar
            </Typography>
          )}
        </Box>

        {!disabled && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
            sx={{
              borderColor: '#E4E4E7',
              color: '#18181B',
              fontSize: '0.8125rem',
              px: 2.5,
              py: 0.875,
              '&:hover': {
                borderColor: '#A1A1AA',
                bgcolor: '#F4F4F5',
              },
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

        <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="center">
          {FORMATS.map((fmt) => (
            <Chip
              key={fmt}
              label={fmt}
              size="small"
              variant="outlined"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontFamily: '"JetBrains Mono", monospace',
                borderColor: '#E4E4E7',
                color: '#71717A',
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
