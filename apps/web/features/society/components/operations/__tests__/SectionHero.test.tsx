import React from "react";
import { render, screen } from "@testing-library/react";
import { SectionHero } from "../SectionHero";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "@testing-library/jest-dom";

// Mock the DESIGN_SYSTEM to avoid absolute path issues in tests if any
jest.mock("@/shared/theme/design-system", () => ({
  DESIGN_SYSTEM: {
    GRADIENTS: {
      DARK: { blue: "gradient-dark-blue" },
      LIGHT: { blue: "gradient-light-blue" }
    },
    COLORS: { blue: "#3b82f6" }
  }
}));

const theme = createTheme({ palette: { mode: "light" } });

describe("SectionHero Component", () => {
  it("renders with correct title and description", () => {
    render(
      <ThemeProvider theme={theme}>
        <SectionHero
          icon={<span data-testid="icon">icon</span>}
          eyebrow="Eye"
          title="Section Title"
          description="Section Description"
        />
      </ThemeProvider>
    );

    expect(screen.getByText("Section Title")).toBeInTheDocument();
    expect(screen.getByText("Section Description")).toBeInTheDocument();
    expect(screen.getByText("Eye")).toBeInTheDocument();
  });

  it("renders custom actions when provided", () => {
    render(
      <ThemeProvider theme={theme}>
        <SectionHero
          icon={<span>icon</span>}
          eyebrow="Eye"
          title="Title"
          description="Desc"
          actions={<button>Click Me</button>}
        />
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });
});
