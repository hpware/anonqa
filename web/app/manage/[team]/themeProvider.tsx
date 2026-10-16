"use client";
import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from "next-themes";

type Theme = "light" | "dark" | "system";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemeProvider>
  );
}

export const useTheme = () => {
  const { theme, setTheme } = useNextTheme();
  return { theme: (theme ?? "system") as Theme, setTheme };
};
