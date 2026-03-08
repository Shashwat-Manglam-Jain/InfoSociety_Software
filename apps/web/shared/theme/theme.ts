import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0e6da6"
    },
    secondary: {
      main: "#ff8f1f"
    },
    background: {
      default: "#f4f9ff",
      paper: "#ffffff"
    },
    text: {
      primary: "#10253d",
      secondary: "#365777"
    }
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: 'var(--font-body), "Segoe UI", sans-serif',
    h1: {
      fontFamily: 'var(--font-heading), sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.02em"
    },
    h2: {
      fontFamily: 'var(--font-heading), sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.02em"
    },
    h3: {
      fontFamily: 'var(--font-heading), sans-serif',
      fontWeight: 650
    },
    h4: {
      fontFamily: 'var(--font-heading), sans-serif',
      fontWeight: 650
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #d4e8f8",
          boxShadow: "0 14px 30px rgba(21, 84, 127, 0.1)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600
        }
      }
    }
  }
});
