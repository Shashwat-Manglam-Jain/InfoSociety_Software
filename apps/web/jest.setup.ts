import "@testing-library/jest-dom";
import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a theme for testing
const testTheme = createTheme();

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return React.createElement("img", props);
  }
}));

// Mock next/link  
jest.mock("next/link", () => ({
  __esModule: true,
  default: React.forwardRef<HTMLAnchorElement, { href: string; children: React.ReactNode }>(
    ({ href, children, ...props }, ref) => React.createElement("a", { href, ref, ...props }, children)
  )
}));

// Mock useTheme hook to return test theme
jest.mock("@mui/material/styles", () => {
  const actual = jest.requireActual("@mui/material/styles");
  return {
    ...actual,
    useTheme: () => testTheme,
    createTheme: actual.createTheme,
    ThemeProvider: actual.ThemeProvider,
    styled: actual.styled,
  };
});
