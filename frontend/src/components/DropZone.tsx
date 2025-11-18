import React, { useRef } from 'react'
import {
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

interface DropZoneProps {
  onFile: (f: File) => void
  disabled?: boolean
}

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
    <Paper
      ref={ref}
      elevation={over && !disabled ? 12 : 3}
      sx={{
        p: 6,
        border: '3px dashed',
        borderColor: disabled ? 'grey.200' : (over ? 'primary.main' : 'grey.300'),
        bgcolor: disabled ? 'grey.100' : (over ? 'primary.50' : 'background.paper'),
        background: over && !disabled
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
          : disabled ? 'grey.100' : 'background.paper',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'center',
        opacity: disabled ? 0.6 : 1,
        transform: over && !disabled ? 'scale(1.02)' : 'scale(1)',
        '&:hover': {
          borderColor: disabled ? 'grey.200' : 'primary.main',
          bgcolor: disabled ? 'grey.100' : 'grey.50',
          transform: disabled ? 'scale(1)' : 'scale(1.01)',
          boxShadow: disabled ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.2)',
        },
      }}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <Stack spacing={2} alignItems="center">
        {disabled ? (
          <CircularProgress size={64} />
        ) : (
          <CloudUploadIcon sx={{ fontSize: 64, color: over ? 'primary.main' : 'grey.400' }} />
        )}

        <Typography variant="h6" color="text.primary">
          {disabled ? 'Enviando arquivo...' : 'Arraste seu documento aqui'}
        </Typography>

        {!disabled && (
          <>
            <Typography variant="body2" color="text.secondary">
              ou
            </Typography>

            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              Selecionar arquivo
            </Button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".doc,.docx,.pdf,.md,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={disabled}
        />

        <Box>
          <Chip label="PDF" size="small" sx={{ mr: 1 }} />
          <Chip label="DOCX" size="small" sx={{ mr: 1 }} />
          <Chip label="DOC" size="small" sx={{ mr: 1 }} />
          <Chip label="MD" size="small" />
        </Box>

        {file && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'success.50',
              border: '1px solid',
              borderColor: 'success.200',
              width: '100%'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <FileIcon color="success" />
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="body1" fontWeight={600}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Paper>
  )
}