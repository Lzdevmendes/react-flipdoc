import React, { useRef } from 'react'
import {
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Stack
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

export default function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const { ref, file, setFile, over } = useDragAndDrop()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      onFile(f)
    }
  }

  return (
    <Paper
      ref={ref}
      elevation={over ? 8 : 2}
      sx={{
        p: 4,
        border: over ? '2px dashed' : '2px dashed',
        borderColor: over ? 'primary.main' : 'grey.300',
        bgcolor: over ? 'primary.50' : 'background.paper',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textAlign: 'center',
        '&:hover': {
          borderColor: 'primary.light',
          bgcolor: 'grey.50',
        },
      }}
      onClick={() => inputRef.current?.click()}
    >
      <Stack spacing={2} alignItems="center">
        <CloudUploadIcon sx={{ fontSize: 64, color: over ? 'primary.main' : 'grey.400' }} />

        <Typography variant="h6" color="text.primary">
          Arraste seu documento aqui
        </Typography>

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

        <input
          ref={inputRef}
          type="file"
          accept=".doc,.docx,.pdf,.md,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
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