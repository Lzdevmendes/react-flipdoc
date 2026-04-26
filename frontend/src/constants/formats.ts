export type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

export const FORMAT_COLORS: Record<string, string> = {
  pdf:  '#DC2626',
  docx: '#2563EB',
  doc:  '#2563EB',
  md:   '#7C3AED',
  txt:  '#059669',
  odt:  '#D97706',
}

export const STATUS_CONFIG: Record<JobStatus, { label: string; bg: string; color: string }> = {
  pending:    { label: 'Pendente',    bg: '#F4F4F5', color: '#71717A' },
  processing: { label: 'Processando', bg: '#EFF6FF', color: '#2563EB' },
  done:       { label: 'Concluído',   bg: '#DCFCE7', color: '#15803D' },
  failed:     { label: 'Falhou',      bg: '#FEE2E2', color: '#DC2626' },
}
