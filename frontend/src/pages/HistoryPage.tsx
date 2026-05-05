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
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material'
import axios from 'axios'
import { FORMAT_COLORS, STATUS_CONFIG, JobStatus } from '../constants/formats'
import { formatRelativeDate } from '../utils/format'

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


function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 600,
        fontFamily: '"JetBrains Mono", monospace',
        bgcolor: cfg.bg,
        color: cfg.color,
        border: 'none',
        borderRadius: '6px',
      }}
    />
  )
}

function FormatBadge({ format }: { format: string }) {
  const color = FORMAT_COLORS[format.toLowerCase()] || '#6B7280'
  return (
    <Chip
      label={format.toUpperCase()}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.68rem',
        fontWeight: 700,
        fontFamily: '"JetBrains Mono", monospace',
        bgcolor: `${color}10`,
        color,
        border: `1px solid ${color}28`,
        borderRadius: '6px',
      }}
    />
  )
}

// ── Stats resumo ──────────────────────────────────────────────────────────────

function StatsRow({ jobs }: { jobs: Job[] }) {
  const done    = jobs.filter((j) => j.status === 'done').length
  const failed  = jobs.filter((j) => j.status === 'failed').length
  const pending = jobs.filter((j) => j.status === 'pending' || j.status === 'processing').length

  if (jobs.length === 0) return null

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2.5, gap: 1 }}>
      {done > 0 && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{
          px: 1.25, py: 0.5, borderRadius: '8px',
          bgcolor: '#F0FDF4', border: '1px solid #BBF7D0',
        }}>
          <CheckCircleIcon sx={{ fontSize: 13, color: '#16A34A' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803D', fontFamily: '"JetBrains Mono", monospace' }}>
            {done} concluído{done > 1 ? 's' : ''}
          </Typography>
        </Stack>
      )}
      {failed > 0 && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{
          px: 1.25, py: 0.5, borderRadius: '8px',
          bgcolor: '#FEF2F2', border: '1px solid #FECACA',
        }}>
          <ErrorIcon sx={{ fontSize: 13, color: '#DC2626' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', fontFamily: '"JetBrains Mono", monospace' }}>
            {failed} falhado{failed > 1 ? 's' : ''}
          </Typography>
        </Stack>
      )}
      {pending > 0 && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{
          px: 1.25, py: 0.5, borderRadius: '8px',
          bgcolor: '#EFF6FF', border: '1px solid #BFDBFE',
        }}>
          <PendingIcon sx={{ fontSize: 13, color: '#2563EB' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', fontFamily: '"JetBrains Mono", monospace' }}>
            {pending} em andamento
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}

// ── Card mobile ───────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const color = FORMAT_COLORS[job.target_format.toLowerCase()] || '#6B7280'

  return (
    <Paper
      elevation={0}
      className="animate-fadeIn"
      sx={{
        border: '1px solid #E4E4E7',
        borderRadius: '14px',
        p: { xs: 1.75, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: '#D4D4D8', bgcolor: '#FAFAF9' },
      }}
    >
      {/* Ícone do formato */}
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '11px',
          bgcolor: `${color}0D`,
          border: `1.5px solid ${color}28`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          gap: 0.25,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.55rem',
            color,
            fontWeight: 700,
            lineHeight: 1,
            opacity: 0.65,
          }}
        >
          .{job.target_format}
        </Typography>
        <FileIcon sx={{ fontSize: 15, color, opacity: 0.85 }} />
      </Box>

      {/* Informações */}
      <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.85rem', sm: '0.875rem' },
            color: '#18181B',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.625,
            lineHeight: 1.3,
          }}
        >
          {job.original_name}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <StatusBadge status={job.status} />
          <FormatBadge format={job.target_format} />
          <Typography sx={{ fontSize: '0.68rem', color: '#B4B4B8', fontFamily: '"JetBrains Mono", monospace' }}>
            {formatRelativeDate(job.created_at)}
          </Typography>
        </Stack>
      </Box>

      {/* Download */}
      {job.status === 'done' && (
        <Tooltip title="Baixar arquivo" placement="left">
          <IconButton
            size="small"
            href={`/api/jobs/${job.id}/download`}
            aria-label={`Baixar ${job.original_name}`}
            sx={{
              border: '1px solid #E4E4E7',
              borderRadius: '10px',
              color: '#71717A',
              flexShrink: 0,
              minWidth: 38,
              minHeight: 38,
              '&:hover': { bgcolor: '#F0FDF4', borderColor: '#86EFAC', color: '#16A34A' },
            }}
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <Stack spacing={1.5}>
      {[...Array(5)].map((_, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{ border: '1px solid #E4E4E7', borderRadius: '14px', p: 1.75, display: 'flex', gap: 1.75, alignItems: 'center' }}
        >
          <Skeleton variant="rectangular" width={46} height={46} sx={{ borderRadius: '11px', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={18} sx={{ mb: 0.75 }} />
            <Stack direction="row" spacing={0.75}>
              <Skeleton variant="rectangular" width={64} height={22} sx={{ borderRadius: '6px' }} />
              <Skeleton variant="rectangular" width={44} height={22} sx={{ borderRadius: '6px' }} />
            </Stack>
          </Box>
        </Paper>
      ))}
    </Stack>
  )
}

function SkeletonTable() {
  return (
    <Paper elevation={0} sx={{ border: '1px solid #E4E4E7', borderRadius: '12px', overflow: 'hidden' }}>
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex', gap: 3, px: 2.5, py: 1.875,
            borderBottom: i < 5 ? '1px solid #F4F4F5' : 'none',
            alignItems: 'center',
          }}
        >
          <Skeleton variant="text" width="38%" height={18} />
          <Skeleton variant="rectangular" width={52} height={22} sx={{ borderRadius: '6px' }} />
          <Skeleton variant="rectangular" width={76} height={22} sx={{ borderRadius: '6px' }} />
          <Skeleton variant="text" width="10%" height={18} sx={{ ml: 'auto' }} />
        </Box>
      ))}
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

  React.useEffect(() => { setPage(0) }, [searchQuery, statusFilter])

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
    setPage(0)
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: { xs: 3, sm: 3.5 },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{ color: '#18181B', mb: 0.5, fontSize: { xs: '1.4rem', sm: '1.65rem', md: '1.875rem' } }}
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
              <CircularProgress size={11} sx={{ color: '#D4D4D8' }} />
            )}
          </Stack>
        </Box>

        <Tooltip title="Atualizar lista">
          <IconButton
            onClick={() => refetch()}
            size="small"
            aria-label="Atualizar lista"
            sx={{
              border: '1px solid #E4E4E7',
              borderRadius: '9px',
              color: '#71717A',
              minWidth: 40,
              minHeight: 40,
              flexShrink: 0,
              '&:hover': { bgcolor: '#F4F4F5', color: '#18181B' },
            }}
          >
            <RefreshIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filtros */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nome do arquivo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: '#C4C4C8' }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: '#FFFFFF',
              borderRadius: '9px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E4E4E7' },
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 156 }, flexShrink: 0 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
            displayEmpty
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '9px',
              fontSize: '0.875rem',
              color: statusFilter === 'all' ? '#A1A1AA' : '#18181B',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E4E4E7' },
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
            py: { xs: 7, sm: 10 },
            border: '1px dashed #E4E4E7',
            borderRadius: '16px',
            bgcolor: '#FAFAF9',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: '#F4F4F5',
              border: '1px solid #E4E4E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <FileIcon sx={{ fontSize: 26, color: '#C4C4C8' }} />
          </Box>
          <Typography
            sx={{ fontWeight: 700, color: '#18181B', mb: 0.75, fontSize: { xs: '0.9375rem', sm: '1rem' } }}
          >
            {searchQuery || statusFilter !== 'all' ? 'Nenhum resultado' : 'Nenhuma conversão ainda'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#A1A1AA', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            {searchQuery || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Faça o upload de um documento para começar'}
          </Typography>
        </Box>
      )}

      {/* Conteúdo */}
      {!isLoading && !isError && filteredJobs.length > 0 && (
        <>
          {/* Resumo de stats */}
          <StatsRow jobs={filteredJobs} />

          {/* ── Mobile: cards ─────────────────────────────────── */}
          <Stack spacing={1.25} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filteredJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </Stack>

          {/* ── Desktop: tabela ───────────────────────────────── */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: '1px solid #E4E4E7',
                borderRadius: '14px',
                overflow: 'hidden',
                overflowX: 'auto',
              }}
            >
              <Table sx={{ minWidth: 520 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAFAF9' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#71717A', py: 1.5 }}>
                      <TableSortLabel
                        active={orderBy === 'original_name'}
                        direction={orderBy === 'original_name' ? order : 'asc'}
                        onClick={() => handleSort('original_name')}
                      >
                        Arquivo
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#71717A', py: 1.5 }}>
                      Formato
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#71717A', py: 1.5 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#71717A', py: 1.5 }}>
                      <TableSortLabel
                        active={orderBy === 'created_at'}
                        direction={orderBy === 'created_at' ? order : 'asc'}
                        onClick={() => handleSort('created_at')}
                      >
                        Data
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#71717A', py: 1.5 }}>
                      Ação
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      sx={{
                        '&:hover': { bgcolor: '#FAFAF9' },
                        '&:last-child td': { borderBottom: 'none' },
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      <TableCell sx={{ maxWidth: 260, py: 1.5 }}>
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
                            fontSize: '0.65rem',
                            color: '#C4C4C8',
                          }}
                        >
                          {job.id.slice(0, 8)}...
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <FormatBadge format={job.target_format} />
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <StatusBadge status={job.status} />
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#18181B', mb: 0.125 }}>
                          {new Date(job.created_at).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.68rem',
                            color: '#B4B4B8',
                          }}
                        >
                          {new Date(job.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1.5 }}>
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
                                minWidth: 36,
                                minHeight: 36,
                                '&:hover': { bgcolor: '#F0FDF4', borderColor: '#86EFAC', color: '#16A34A' },
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
            rowsPerPageOptions={[5, 10, 25]}
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
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
              },
              '& .MuiTablePagination-select': { fontSize: { xs: '0.72rem', sm: '0.8rem' } },
            }}
          />
        </>
      )}
    </Box>
  )
}
