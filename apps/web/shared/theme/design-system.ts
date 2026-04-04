/**
 * Institutional Design System Constants
 * 
 * Centralized theme tokens for consistent branding across the society operations workspace.
 * Includes multi-stop gradients, accent colors, and surface tokens.
 */

export const DESIGN_SYSTEM = {
  GRADIENTS: {
    DARK: {
      blue: "linear-gradient(135deg, #0f172a 0%, #1e293b 35%, #2563eb 100%)",
      emerald: "linear-gradient(135deg, #064e3b 0%, #065f46 35%, #10b981 100%)",
      violet: "linear-gradient(135deg, #4c1d95 0%, #5b21b6 35%, #8b5cf6 100%)",
      rose: "linear-gradient(135deg, #881337 0%, #9f1239 35%, #e11d48 100%)",
      amber: "linear-gradient(135deg, #78350f 0%, #92400e 35%, #f59e0b 100%)",
      sky: "linear-gradient(135deg, #0c4a6e 0%, #075985 35%, #0ea5e9 100%)"
    },
    LIGHT: {
      blue: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
      emerald: "linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)",
      violet: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #8b5cf6 100%)",
      rose: "linear-gradient(135deg, #881337 0%, #e11d48 50%, #fb7185 100%)",
      amber: "linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)",
      sky: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0ea5e9 100%)"
    }
  },
  COLORS: {
    blue: "#3b82f6",
    emerald: "#10b981",
    violet: "#8b5cf6",
    rose: "#f43f5e",
    amber: "#f59e0b",
    sky: "#0ea5e9"
  },
  SURFACES: {
    DARK: {
      background: "#0a0f1e",
      paper: "background.paper",
      tableHead: "rgba(255,255,255,0.02)",
      border: "rgba(255,255,255,0.08)",
      tableBorder: "rgba(255,255,255,0.05)",
      input: "rgba(255,255,255,0.05)",
      inputBorder: "rgba(255,255,255,0.1)"
    },
    LIGHT: {
      background: "#f8fafc",
      paper: "#fff",
      tableHead: "#f8fafc",
      border: "rgba(15, 23, 42, 0.08)",
      tableBorder: "rgba(15, 23, 42, 0.04)",
      input: "rgba(255,255,255,0.08)",
      inputBorder: "rgba(255,255,255,0.12)"
    }
  },
  SHADOWS: {
    SOFT: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    DEEP: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }
} as const;

export type DesignColorScheme = keyof typeof DESIGN_SYSTEM.COLORS;
