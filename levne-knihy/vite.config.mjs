import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { execSync } from "node:child_process";

// Verze aplikace se odvozuje z čísla na začátku názvu aktuální větve (odpovídá číslu pull requestu).
// Když větev číslo nemá (např. build mimo vývojovou větev), vezme se nejvyšší číslo mezi větvemi.
function resolveAppVersion() {
  const numberFromName = (name) => {
    const match = name.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  try {
    const branch = execSync("git branch --show-current", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const current = numberFromName(branch);
    if (current !== null) return String(current);

    const branches = execSync("git branch --format=%(refname:short)", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const numbers = branches.split(/\r?\n/).map(numberFromName).filter((value) => value !== null);
    if (numbers.length > 0) return String(Math.max(...numbers));
  } catch {
    // Git není k dispozici (například build bez repozitáře).
  }

  return "0";
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(resolveAppVersion()),
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
