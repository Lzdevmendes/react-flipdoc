import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'

interface Props {
  children: React.ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 2,
            px: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ErrorIcon sx={{ fontSize: 28, color: '#DC2626' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#18181B' }}>
            Algo deu errado
          </Typography>
          <Typography variant="body2" sx={{ color: '#71717A', maxWidth: 360 }}>
            {this.state.error.message}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => this.setState({ error: null })}
            sx={{ borderColor: '#E4E4E7', color: '#18181B', borderRadius: '10px' }}
          >
            Tentar novamente
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
