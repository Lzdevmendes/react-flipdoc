import React from 'react'
import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab
} from '@mui/material'
import { Upload as UploadIcon, History as HistoryIcon } from '@mui/icons-material'
import UploadPage from './pages/UploadPage'
import HistoryPage from './pages/HistoryPage'

function Navigation() {
  const location = useLocation()
  const currentTab = location.pathname === '/history' ? 1 : 0

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4, fontWeight: 700 }}>
          FlipDoc
        </Typography>
        <Tabs value={currentTab} textColor="inherit" indicatorColor="secondary">
          <Tab
            label="Upload"
            icon={<UploadIcon />}
            iconPosition="start"
            component={RouterLink}
            to="/"
          />
          <Tab
            label="Histórico"
            icon={<HistoryIcon />}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  )
}
