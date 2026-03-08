import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#005792"
    },
    secondary: {
      main: "#ff7a00"
    },
    background: {
      default: "#eef5fb",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 14
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", "Tahoma", sans-serif',
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    h3: {
      fontWeight: 600
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #d6e6f7"
        }
      }
    }
  }
});
