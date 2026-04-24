import { Box, Typography } from '@mui/material'

export type TargetFormat = 'pdf' | 'docx' | 'md' | 'txt' | 'odt'

interface FormatOption {
  value: TargetFormat
  label: string
  ext: string
  desc: string
  accent: string
  bg: string
}

const formatOptions: FormatOption[] = [
  { value: 'pdf',  label: 'PDF',      ext: '.pdf',  desc: 'Portable Document', accent: '#DC2626', bg: '#FEF2F2' },
  { value: 'docx', label: 'Word',     ext: '.docx', desc: 'Microsoft Word',    accent: '#2563EB', bg: '#EFF6FF' },
  { value: 'md',   label: 'Markdown', ext: '.md',   desc: 'Texto formatado',   accent: '#7C3AED', bg: '#F5F3FF' },
  { value: 'txt',  label: 'Texto',    ext: '.txt',  desc: 'Texto simples',     accent: '#059669', bg: '#ECFDF5' },
  { value: 'odt',  label: 'ODT',      ext: '.odt',  desc: 'Open Document',     accent: '#D97706', bg: '#FFFBEB' },
]

interface FormatSelectorProps {
  value: TargetFormat
  onChange: (format: TargetFormat) => void
  disabled?: boolean
}

export default function FormatSelector({ value, onChange, disabled = false }: FormatSelectorProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
        gap: { xs: 1, sm: 1.5 },
      }}
      role="radiogroup"
      aria-label="Formato de destino"
    >
      {formatOptions.map((opt) => {
        const isSelected = opt.value === value
        return (
          <Box
            key={opt.value}
            onClick={() => !disabled && onChange(opt.value)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onChange(opt.value)
              }
            }}
            sx={{
              border: '1.5px solid',
              borderColor: isSelected ? opt.accent : '#E4E4E7',
              borderRadius: '10px',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1, sm: 1.25 },
              cursor: disabled ? 'not-allowed' : 'pointer',
              bgcolor: isSelected ? opt.bg : '#FFFFFF',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:focus-visible': {
                boxShadow: `0 0 0 3px ${opt.accent}40`,
              },
              '&:hover': !disabled
                ? { borderColor: isSelected ? opt.accent : '#A1A1AA', bgcolor: isSelected ? opt.bg : '#F9F9F9' }
                : {},
            }}
          >
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
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
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 700,
                color: isSelected ? opt.accent : '#18181B',
                lineHeight: 1.2,
              }}
            >
              {opt.label}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.68rem', sm: '0.72rem' },
                color: isSelected ? opt.accent : '#A1A1AA',
                mt: 0.25,
                opacity: 0.85,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {opt.desc}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
