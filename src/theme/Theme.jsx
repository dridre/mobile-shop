import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f50057',
            light: '#ff5983',
            dark: '#bb002f',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
            disabled: '#bdbdbd',
        },
        error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
        },
        warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
        },
        info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
        },
        success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 500,
        },
        h5: {
            fontWeight: 500,
        },
        h6: {
            fontWeight: 500,
        },
        subtitle1: {
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
                contained: {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 8,
                },
            },
        },
    },
});

export default theme;