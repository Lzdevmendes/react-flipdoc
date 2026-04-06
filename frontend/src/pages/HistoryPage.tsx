import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TableSortLabel,
  InputAdornment,
  Skeleton,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material'
import axios from 'axios'

type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

interface Job {
  id: string
  original_name: string
  target_format: string
  status: JobStatus
  created_at: string
  download_path?: string
}

interface JobsResponse {
  jobs: Job[]
  total: number
  limit: number
  offset: number
}

async function fetchJobs(limit: number, offset: number): Promise<JobsResponse> {
  const response = await axios.get('/api/jobs', { params: { limit, offset } })
  return response.data
}

const statusConfig = {
  pending:    { label: 'Pendente',    bg: '#F4F4F5', color: '#71717A' },
  processing: { label: 'Processando', bg: '#EFF6FF', color: '#2563EB' },
  done:       { label: 'Concluído',   bg: '#DCFCE7', color: '#15803D' },
  failed:     { label: 'Falhou',      bg: '#FEE2E2', color: '#DC2626' },
}

const formatColors: Record<string, string> = {
  pdf:  '#DC2626',
  docx: '#2563EB',
  doc:  '#2563EB',
  md:   '#7C3AED',
  txt:  '#059669',
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60)   return 'agora mesmo'
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('pt-BR')
}

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = statusConfig[status]
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.72rem',
        fontWeight: 600,
        fontFamily: '"JetBrains Mono", monospace',
        bgcolor: cfg.bg,
        color: cfg.color,
        border: 'none',
      }}
    />
  )
}

function FormatBadge({ format }: { format: string }) {
  const color = formatColors[format.toLowerCase()] || '#6B7280'
  return (
    <Chip
      label={format.toUpperCase()}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 600,
        fontFamily: '"JetBrains Mono", monospace',
        bgcolor: `${color}12`,
        color,
        border: `1px solid ${color}30`,
      }}
    />
  )
}

// ── Card mobile ───────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const color = formatColors[job.target_format.toLowerCase()] || '#6B7280'

  return (
    <Paper
      elevation={0}
      className="animate-fadeIn"
      sx={{
        border: '1px solid #E4E4E7',
        borderRadius: '12px',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        '&:hover': { borderColor: '#D4D4D8', bgcolor: '#FAFAF9' },
        transition: 'all 0.15s ease',
      }}
    >
      {/* Ícone do formato */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          bgcolor: `${color}10`,
          border: `1.5px solid ${color}30`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.6rem',
            color,
            fontWeight: 700,
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          .{job.target_format}
        </Typography>
        <FileIcon sx={{ fontSize: 14, color, mt: 0.25 }} />
      </Box>

      {/* Informações */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#18181B',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {job.original_name}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          <StatusBadge status={job.status} />
          <Typography sx={{ fontSize: '0.7rem', color: '#A1A1AA', fontFamily: '"JetBrains Mono", monospace' }}>
            {formatRelativeDate(job.created_at)}
          </Typography>
        </Stack>
      </Box>

      {/* Download */}
      {job.status === 'done' && (
        <Tooltip title="Baixar arquivo">
          <IconButton
            size="small"
            href={`/api/jobs/${job.id}/download`}
            aria-label={`Baixar ${job.original_name}`}
            sx={{
              border: '1px solid #E4E4E7',
              borderRadius: '8px',
              color: '#71717A',
              flexShrink: 0,
              minWidth: 36,
              minHeight: 36,
              '&:hover': { bgcolor: '#F0FDF4', borderColor: '#BBF7D0', color: '#16A34A' },
            }}
          >
            <DownloadIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  )
}

// ── Skeleton de carregamento ──────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <Stack spacing={1.5}>
      {[...Array(5)].map((_, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{ border: '1px solid #E4E4E7', borderRadius: '12px', p: 2, display: 'flex', gap: 1.5 }}
        >
          <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: '10px', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="65%" height={20} sx={{ mb: 0.75 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Paper>
      ))}
    </Stack>
  )
}

function SkeletonTable() {
  return (
    <Paper elevation={0} sx={{ border: '1px solid #E4E4E7', borderRadius: '12px', overflow: 'hidden' }}>
      <Box sx={{ p: 0 }}>
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex', gap: 3, px: 2.5, py: 1.75,
              borderBottom: i < 5 ? '1px solid #F4F4F5' : 'none',
              alignItems: 'center',
            }}
          >
            <Skeleton variant="text" width="35%" height={18} />
            <Skeleton variant="rectangular" width={48} height={22} sx={{ borderRadius: '100px' }} />
            <Skeleton variant="rectangular" width={72} height={22} sx={{ borderRadius: '100px' }} />
            <Skeleton variant="text" width="12%" height={18} sx={{ ml: 'auto' }} />
          </Box>
        ))}
      </Box>
    </Paper>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [page, setPage]               = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [orderBy, setOrderBy]         = useState<'created_at' | 'original_name'>('created_at')
  const [order, setOrder]             = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['jobs', page, rowsPerPage],
    queryFn: () => fetchJobs(rowsPerPage, page * rowsPerPage),
    refetchInterval: 5000,
  })

  const filteredJobs = React.useMemo(() => {
    if (!data?.jobs) return []
    let filtered = data.jobs

    if (searchQuery) {
      filtered = filtered.filter((job) =>
        job.original_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === statusFilter)
    }

    filtered.sort((a, b) => {
      const av = orderBy === 'created_at' ? new Date(a.created_at).getTime() : a.original_name
      const bv = orderBy === 'created_at' ? new Date(b.created_at).getTime() : b.original_name
      return order === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
    })
    return filtered
  }, [data?.jobs, searchQuery, statusFilter, orderBy, order])

  const handleSort = (column: 'created_at' | 'original_name') => {
    const isAsc = orderBy === column && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(column)
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: { xs: 3, sm: 4 },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{ color: '#18181B', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
          >
            Histórico
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              sx={{ color: '#71717A', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {data?.total ?? 0} conversões realizadas
            </Typography>
            {isFetching && !isLoading && (
              <CircularProgress size={12} sx={{ color: '#A1A1AA' }} />
            )}
          </Stack>
        </Box>

        <Tooltip title="Atualizar">
          <IconButton
            onClick={() => refetch()}
            size="small"
            aria-label="Atualizar lista"
            sx={{
              border: '1px solid #E4E4E7',
              borderRadius: '8px',
              color: '#71717A',
              minWidth: 40,
              minHeight: 40,
              '&:hover': { bgcolor: '#F4F4F5', color: '#18181B' },
            }}
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filtros */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nome do arquivo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: '#A1A1AA' }} />
              </InputAdornment>
            ),
            sx: { bgcolor: '#FFFFFF', borderRadius: '8px', fontSize: '0.875rem' },
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 }, flexShrink: 0 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
            displayEmpty
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: statusFilter === 'all' ? '#71717A' : '#18181B',
            }}
          >
            <MenuItem value="all"        sx={{ fontSize: '0.875rem' }}>Todos os status</MenuItem>
            <MenuItem value="pending"    sx={{ fontSize: '0.875rem' }}>Pendente</MenuItem>
            <MenuItem value="processing" sx={{ fontSize: '0.875rem' }}>Processando</MenuItem>
            <MenuItem value="done"       sx={{ fontSize: '0.875rem' }}>Concluído</MenuItem>
            <MenuItem value="failed"     sx={{ fontSize: '0.875rem' }}>Falhou</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Loading skeleton */}
      {isLoading && (
        <>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <SkeletonCards />
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <SkeletonTable />
          </Box>
        </>
      )}

      {/* Erro */}
      {isError && (
        <Alert
          severity="error"
          sx={{ borderRadius: '10px', border: '1px solid #FECACA', bgcolor: '#FEF2F2' }}
        >
          Erro ao carregar histórico: {(error as Error).message}
        </Alert>
      )}

      {/* Vazio */}
      {!isLoading && !isError && filteredJobs.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, sm: 10 },
            border: '1px dashed #E4E4E7',
            borderRadius: '14px',
            bgcolor: '#FAFAF9',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: '#F4F4F5',
              border: '1px solid #E4E4E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <FileIcon sx={{ fontSize: 24, color: '#A1A1AA' }} />
          </Box>
          <Typography
            sx={{ fontWeight: 600, color: '#18181B', mb: 0.75, fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Nenhuma conversão encontrada
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#71717A', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            {searchQuery || statusFilter !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Faça o upload de um documento para começar'}
          </Typography>
        </Box>
      )}

      {/* Conteúdo */}
      {!isLoading && !isError && filteredJobs.length > 0 && (
        <>
          {/* ── Mobile: cards ─────────────────────────────────── */}
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filteredJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </Stack>

          {/* ── Desktop: tabela ───────────────────────────────── */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: '1px solid #E4E4E7',
                borderRadius: '12px',
                overflow: 'hidden',
                overflowX: 'auto',
              }}
            >
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAFAF9' }}>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'original_name'}
                        direction={orderBy === 'original_name' ? order : 'asc'}
                        onClick={() => handleSort('original_name')}
                      >
                        Arquivo
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Formato</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'created_at'}
                        direction={orderBy === 'created_at' ? order : 'asc'}
                        onClick={() => handleSort('created_at')}
                      >
                        Data
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Download</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      sx={{
                        '&:hover': { bgcolor: '#FAFAF9' },
                        '&:last-child td': { borderBottom: 'none' },
                      }}
                    >
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: '#18181B',
                            mb: 0.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {job.original_name}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.68rem',
                            color: '#A1A1AA',
                          }}
                        >
                          {job.id.slice(0, 8)}...
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <FormatBadge format={job.target_format} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#18181B', mb: 0.125 }}>
                          {new Date(job.created_at).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.7rem',
                            color: '#A1A1AA',
                          }}
                        >
                          {new Date(job.created_at).toLocaleTimeString('pt-BR')}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {job.status === 'done' && (
                          <Tooltip title="Baixar arquivo">
                            <IconButton
                              size="small"
                              href={`/api/jobs/${job.id}/download`}
                              aria-label={`Baixar ${job.original_name}`}
                              sx={{
                                border: '1px solid #E4E4E7',
                                borderRadius: '7px',
                                color: '#71717A',
                                minWidth: 36,
                                minHeight: 36,
                                '&:hover': { bgcolor: '#F0FDF4', borderColor: '#BBF7D0', color: '#16A34A' },
                              }}
                            >
                              <DownloadIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Paginação */}
          <TablePagination
            component="div"
            count={data?.total || 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Por página
              </Box>
            }
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            sx={{
              mt: 0.5,
              color: '#71717A',
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              },
            }}
          />
        </>
      )}
    </Box>
  )
}
