"use client";

import React from "react";
import { TableRow, TableCell, Typography } from "@mui/material";

export type TableEmptyProps = {
  colSpan: number;
  label: string;
};

export function TableEmpty({ colSpan, label }: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 12 }}>
        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8, fontStyle: "italic" }}>
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
