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
  Chip
} from '@mui/material'
import { Upload as UploadIcon, History as HistoryIcon } from '@mui/icons-material'
import UploadPage from './pages/UploadPage'
import HistoryPage from './pages/HistoryPage'

function Navigation() {
  const location = useLocation()
  const currentTab = location.pathname === '/history' ? 1 : 0

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E4E4E7',
      }}
    >
      <Toolbar sx={{ gap: 3, minHeight: '60px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              bgcolor: '#1A1A2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              component="span"
              sx={{
                color: '#F97316',
                fontWeight: 800,
                fontSize: '0.75rem',
                fontFamily: '"Sora", sans-serif',
                lineHeight: 1,
              }}
            >
              FD
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#18181B',
              fontSize: '0.975rem',
              letterSpacing: '-0.02em',
            }}
          >
            FlipDoc
          </Typography>
          <Chip
            label="beta"
            size="small"
            sx={{
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

        <Tabs
          value={currentTab}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#F97316',
              height: 2,
            },
            '& .MuiTab-root': {
              color: '#71717A',
              fontWeight: 500,
              fontSize: '0.85rem',
              minHeight: '60px',
              paddingX: 0,
              mr: 3,
              '&.Mui-selected': {
                color: '#18181B',
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab
            label="Converter"
            icon={<UploadIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            component={RouterLink}
            to="/"
          />
          <Tab
            label="Histórico"
            icon={<HistoryIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            component={RouterLink}
            to="/history"
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
        <Container maxWidth="lg" sx={{ mt: 5, mb: 6, flex: 1 }}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  )
}
