"use client";

import { createTheme } from "@mui/material/styles";
import { FC, ReactNode } from "react";
import { ThemeProvider as ReactThemeProvider } from '@emotion/react';

const theme = createTheme({
    typography: {
        fontFamily: "var(--font-roboto)",
    },
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
});

interface ThemeProviderProps {
    children: ReactNode;
}


export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
    return <ReactThemeProvider theme={theme}>{children}</ReactThemeProvider>;
};
