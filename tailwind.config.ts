import type { Config } from "tailwindcss";
const config: Config = { darkMode: "class", content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { abyss: "#071126", neon: "#20f7ff", gold: "#f9c74f", plasma: "#a855f7" }, boxShadow: { glow: "0 0 30px rgba(32,247,255,.35)", gold: "0 0 25px rgba(249,199,79,.35)" } } }, plugins: [] };
export default config;
