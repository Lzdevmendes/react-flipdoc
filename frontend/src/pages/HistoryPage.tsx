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
  InputLabel,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TableSortLabel
} from '@mui/material'
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import axios from 'axios'

// Tipos
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

// Função para buscar jobs
async function fetchJobs(limit: number, offset: number): Promise<JobsResponse> {
  const response = await axios.get('/api/jobs', {
    params: { limit, offset }
  })
  return response.data
}

// Componente de Status Badge
function StatusBadge({ status }: { status: JobStatus }) {
  const config = {
    pending: { label: 'Pendente', color: 'default' as const },
    processing: { label: 'Processando', color: 'info' as const },
    done: { label: 'Concluído', color: 'success' as const },
    failed: { label: 'Falhou', color: 'error' as const },
  }

  const { label, color } = config[status]

  return <Chip label={label} color={color} size="small" />
}

export default function HistoryPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [orderBy, setOrderBy] = useState<'created_at' | 'original_name'>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  // React Query para buscar jobs
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobs', page, rowsPerPage],
    queryFn: () => fetchJobs(rowsPerPage, page * rowsPerPage),
    refetchInterval: 5000, // Atualiza a cada 5s
  })

  // Filtrar jobs localmente
  const filteredJobs = React.useMemo(() => {
    if (!data?.jobs) return []

    let filtered = data.jobs

    // Filtro de busca
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.original_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue = orderBy === 'created_at' ? new Date(a.created_at).getTime() : a.original_name
      let bValue = orderBy === 'created_at' ? new Date(b.created_at).getTime() : b.original_name

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [data?.jobs, searchQuery, statusFilter, orderBy, order])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSort = (column: 'created_at' | 'original_name') => {
    const isAsc = orderBy === column && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(column)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Histórico de Conversões
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.total || 0} conversões realizadas
          </Typography>
        </Box>

        <Tooltip title="Atualizar">
          <IconButton onClick={() => refetch()} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nome do arquivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="pending">Pendente</MenuItem>
              <MenuItem value="processing">Processando</MenuItem>
              <MenuItem value="done">Concluído</MenuItem>
              <MenuItem value="failed">Falhou</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Tabela */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar histórico: {(error as Error).message}
        </Alert>
      )}

      {!isLoading && !isError && filteredJobs.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhuma conversão encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchQuery || statusFilter !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Faça o upload de um documento para começar'}
          </Typography>
        </Paper>
      )}

      {!isLoading && !isError && filteredJobs.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'original_name'}
                      direction={orderBy === 'original_name' ? order : 'asc'}
                      onClick={() => handleSort('original_name')}
                    >
                      Arquivo
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Formato de Destino</TableCell>
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
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {job.original_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {job.id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={job.target_format.toUpperCase()} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(job.created_at).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(job.created_at).toLocaleTimeString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {job.status === 'done' && job.download_path && (
                        <Tooltip title="Baixar arquivo">
                          <IconButton
                            size="small"
                            color="primary"
                            href={`/api/jobs/${job.id}/download`}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={data?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Linhas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </>
      )}
    </Box>
  )
}
