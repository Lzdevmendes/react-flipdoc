import React from 'react'
import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Chip,
} from '@mui/material'
import { Upload as UploadIcon, History as HistoryIcon } from '@mui/icons-material'
import UploadPage from './pages/UploadPage'
import HistoryPage from './pages/HistoryPage'
import ErrorBoundary from './components/ErrorBoundary'

function Navigation() {
  const location = useLocation()
  const currentTab = location.pathname === '/history' ? 1 : 0

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E4E4E7', top: 0, zIndex: 100 }}
    >
      <Toolbar
        sx={{
          gap: { xs: 1.5, sm: 3 },
          minHeight: { xs: '52px !important', sm: '60px !important' },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: { xs: 0, sm: 2 }, flexShrink: 0 }}>
          <Box
            sx={{
              width: { xs: 28, sm: 30 },
              height: { xs: 28, sm: 30 },
              borderRadius: '8px',
              bgcolor: '#1A1A2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              component="span"
              sx={{
                color: '#F97316',
                fontWeight: 800,
                fontSize: '0.7rem',
                fontFamily: '"Sora", sans-serif',
                lineHeight: 1,
              }}
            >
              FD
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#18181B',
              fontSize: { xs: '0.875rem', sm: '0.975rem' },
              letterSpacing: '-0.02em',
            }}
          >
            FlipDoc
          </Typography>
          <Chip
            label="beta"
            size="small"
            sx={{
              display: { xs: 'none', sm: 'flex' },
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: '#FEF3C7',
              color: '#B45309',
              border: 'none',
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '0.02em',
            }}
          />
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#F97316', height: 2 },
            '& .MuiTab-root': {
              color: '#71717A',
              fontWeight: 500,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              minHeight: { xs: '52px', sm: '60px' },
              minWidth: { xs: 48, sm: 'auto' },
              px: { xs: 1.5, sm: 0 },
              mr: { xs: 1, sm: 3 },
              '&.Mui-selected': { color: '#18181B', fontWeight: 600 },
            },
          }}
        >
          <Tab
            icon={<UploadIcon sx={{ fontSize: { xs: 17, sm: 16 } }} />}
            iconPosition="start"
            label="Converter"
            component={RouterLink}
            to="/"
            aria-label="Converter documento"
          />
          <Tab
            icon={<HistoryIcon sx={{ fontSize: { xs: 17, sm: 16 } }} />}
            iconPosition="start"
            label="Histórico"
            component={RouterLink}
            to="/history"
            aria-label="Histórico de conversões"
          />
        </Tabs>
      </Toolbar>
    </AppBar>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FAFAF9' }}>
        <Navigation />
        <Container
          maxWidth="lg"
          sx={{
            mt: { xs: 3, sm: 4, md: 5 },
            mb: { xs: 5, md: 6 },
            flex: 1,
          }}
        >
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </ErrorBoundary>
        </Container>
      </Box>
    </BrowserRouter>
  )
}
