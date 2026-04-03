import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1A1A2E',
      light: '#2D2D44',
      dark: '#0D0D1A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F97316',
      light: '#FB923C',
      dark: '#EA580C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFAF9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#18181B',
      secondary: '#71717A',
    },
    success: {
      main: '#16A34A',
      light: '#DCFCE7',
      dark: '#15803D',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
    },
    info: {
      main: '#0EA5E9',
      light: '#E0F2FE',
    },
    divider: '#E4E4E7',
  },
  typography: {
    fontFamily: '"Sora", "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontSize: '1.1rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 4px rgba(0,0,0,0.06)',
    '0 4px 8px rgba(0,0,0,0.06)',
    '0 6px 16px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.08)',
    '0 10px 32px rgba(0,0,0,0.10)',
    '0 12px 40px rgba(0,0,0,0.12)',
    '0 16px 48px rgba(0,0,0,0.14)',
    '0 20px 56px rgba(0,0,0,0.14)',
    '0 24px 64px rgba(0,0,0,0.14)',
    '0 28px 72px rgba(0,0,0,0.14)',
    '0 32px 80px rgba(0,0,0,0.14)',
    '0 36px 88px rgba(0,0,0,0.14)',
    '0 40px 96px rgba(0,0,0,0.14)',
    '0 44px 104px rgba(0,0,0,0.14)',
    '0 48px 112px rgba(0,0,0,0.14)',
    '0 52px 120px rgba(0,0,0,0.14)',
    '0 56px 128px rgba(0,0,0,0.14)',
    '0 60px 136px rgba(0,0,0,0.14)',
    '0 64px 144px rgba(0,0,0,0.14)',
    '0 68px 152px rgba(0,0,0,0.14)',
    '0 72px 160px rgba(0,0,0,0.14)',
    '0 76px 168px rgba(0,0,0,0.14)',
    '0 80px 176px rgba(0,0,0,0.14)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: '#1A1A2E',
          '&:hover': { background: '#2D2D44' },
        },
        containedSecondary: {
          background: '#F97316',
          '&:hover': { background: '#EA580C' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #E4E4E7',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#71717A',
          borderBottom: '1px solid #E4E4E7',
          paddingTop: '12px',
          paddingBottom: '12px',
        },
        body: {
          borderBottom: '1px solid #F4F4F5',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: '#E4E4E7' },
            '&:hover fieldset': { borderColor: '#A1A1AA' },
            '&.Mui-focused fieldset': { borderColor: '#1A1A2E' },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 8,
        },
      },
    },
  },
})
