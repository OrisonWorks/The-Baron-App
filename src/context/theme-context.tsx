"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { THEME_COLOR, THEME_KEY, type Theme } from "@/lib/theme";

const Ctx = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[next]);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
      return next;
    });
  }, []);
  return (
    <Ctx.Provider value={{ theme, toggle }}>
      {children}
      <Toaster position="bottom-center" theme={theme} richColors />
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used inside ThemeProvider");
  return c;
}
