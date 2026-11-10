export type Theme = "light" | "dark";
export const THEME_KEY = "baronTheme";
export const THEME_COLOR: Record<Theme, string> = { light: "#faf8f3", dark: "#0a0a0b" };

// Runs before first paint (inlined in <head>) so a saved dark choice never flashes light.
export const themeInitScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark"){document.documentElement.classList.add("dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLOR.dark}")}}catch(e){}`;
