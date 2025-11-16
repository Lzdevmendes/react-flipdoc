import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Chip,
  Typography,
  Stack
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  Code as CodeIcon,
  TextFields as TextIcon
} from '@mui/icons-material'

export type TargetFormat = 'pdf' | 'docx' | 'md' | 'txt'

interface FormatOption {
  value: TargetFormat
  label: string
  icon: React.ReactNode
  description: string
  color: 'primary' | 'secondary' | 'success' | 'info'
}

const formatOptions: FormatOption[] = [
  {
    value: 'pdf',
    label: 'PDF',
    icon: <PdfIcon />,
    description: 'Portable Document Format',
    color: 'error' as any
  },
  {
    value: 'docx',
    label: 'Word (DOCX)',
    icon: <DocxIcon />,
    description: 'Microsoft Word Document',
    color: 'primary'
  },
  {
    value: 'md',
    label: 'Markdown',
    icon: <CodeIcon />,
    description: 'Markdown Text File',
    color: 'secondary'
  },
  {
    value: 'txt',
    label: 'Texto Puro',
    icon: <TextIcon />,
    description: 'Plain Text File',
    color: 'info'
  }
]

interface FormatSelectorProps {
  value: TargetFormat
  onChange: (format: TargetFormat) => void
  disabled?: boolean
}

export default function FormatSelector({ value, onChange, disabled = false }: FormatSelectorProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as TargetFormat)
  }

  const selectedOption = formatOptions.find(opt => opt.value === value)

  return (
    <Box>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id="format-selector-label">Converter para</InputLabel>
        <Select
          labelId="format-selector-label"
          id="format-selector"
          value={value}
          label="Converter para"
          onChange={handleChange}
          renderValue={(selected) => {
            const option = formatOptions.find(opt => opt.value === selected)
            return (
              <Stack direction="row" spacing={1} alignItems="center">
                {option?.icon}
                <Typography variant="body2">{option?.label}</Typography>
              </Stack>
            )
          }}
        >
          {formatOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Stack direction="row" spacing={2} alignItems="center" width="100%">
                <Box sx={{ color: `${option.color}.main` }}>
                  {option.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
                {option.value === value && (
                  <Chip label="Selecionado" size="small" color={option.color} />
                )}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedOption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 Seu documento será convertido para {selectedOption.label}
        </Typography>
      )}
    </Box>
  )
}
