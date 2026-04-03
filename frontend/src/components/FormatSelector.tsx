import React from 'react'
import { Box, Typography, Stack } from '@mui/material'

export type TargetFormat = 'pdf' | 'docx' | 'md' | 'txt'

interface FormatOption {
  value: TargetFormat
  label: string
  ext: string
  desc: string
  accent: string
  bg: string
}

const formatOptions: FormatOption[] = [
  {
    value: 'pdf',
    label: 'PDF',
    ext: '.pdf',
    desc: 'Portable Document',
    accent: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    value: 'docx',
    label: 'Word',
    ext: '.docx',
    desc: 'Microsoft Word',
    accent: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    value: 'md',
    label: 'Markdown',
    ext: '.md',
    desc: 'Texto formatado',
    accent: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    value: 'txt',
    label: 'Texto',
    ext: '.txt',
    desc: 'Texto simples',
    accent: '#059669',
    bg: '#ECFDF5',
  },
]

interface FormatSelectorProps {
  value: TargetFormat
  onChange: (format: TargetFormat) => void
  disabled?: boolean
}

export default function FormatSelector({ value, onChange, disabled = false }: FormatSelectorProps) {
  return (
    <Box>
      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        {formatOptions.map((opt) => {
          const isSelected = opt.value === value
          return (
            <Box
              key={opt.value}
              onClick={() => !disabled && onChange(opt.value)}
              sx={{
                border: '1.5px solid',
                borderColor: isSelected ? opt.accent : '#E4E4E7',
                borderRadius: '10px',
                px: 2,
                py: 1.25,
                cursor: disabled ? 'not-allowed' : 'pointer',
                bgcolor: isSelected ? opt.bg : '#FFFFFF',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.15s ease',
                minWidth: 100,
                '&:hover': !disabled ? {
                  borderColor: isSelected ? opt.accent : '#A1A1AA',
                  bgcolor: isSelected ? opt.bg : '#F9F9F9',
                } : {},
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: isSelected ? opt.accent : '#A1A1AA',
                  mb: 0.25,
                  letterSpacing: '0.04em',
                }}
              >
                {opt.ext}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: isSelected ? opt.accent : '#18181B',
                  lineHeight: 1.2,
                }}
              >
                {opt.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: isSelected ? opt.accent : '#A1A1AA',
                  mt: 0.25,
                  opacity: 0.85,
                }}
              >
                {opt.desc}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
