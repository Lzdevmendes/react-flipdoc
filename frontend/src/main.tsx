import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'
import { theme } from './theme'
import { queryClient } from './lib/queryClient'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        autoHideDuration={5000}
      >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
)
