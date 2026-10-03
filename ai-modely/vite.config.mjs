import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { execSync } from "node:child_process";

// Verze aplikace se odvozuje z čísla v názvu větve (odpovídá číslu pull requestu).
const numberFromName = (name) => {
  const match = (name || "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const runGit = (command) =>
  execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

// Nejvyšší číslo pull requestu ze zpráv commitů (např. "Merge pull request #42 ...").
// Funguje i na Netlify, kde repozitář nemá větve (build z odpojené hlavy),
// protože zprávy commitů v historii zůstávají.
function numberFromHistory() {
  const subjects = runGit("git log -50 --format=%s");
  const numbers = [...subjects.matchAll(/(?:pull request #|\(#)(\d+)\)?/g)].map((match) =>
    parseInt(match[1], 10)
  );
  return numbers.length > 0 ? Math.max(...numbers) : null;
}

// Pořadí zdrojů verze:
// 1. číslo pull requestu z Netlify (REVIEW_ID u náhledů PR),
// 2. číslo v názvu buildované větve (Netlify nastavuje BRANCH, lokálně git),
// 3. nejvyšší číslo mezi lokálními větvemi,
// 4. nejvyšší číslo pull requestu z historie commitů (produkční build z main na Netlify),
// 5. nouzově "???".
function resolveAppVersion() {
  const reviewId = numberFromName(process.env.REVIEW_ID);
  if (reviewId !== null) return String(reviewId);

  const envBranch = numberFromName(process.env.BRANCH);
  if (envBranch !== null) return String(envBranch);

  try {
    const current = numberFromName(runGit("git branch --show-current"));
    if (current !== null) return String(current);

    // Při odpojené hlavě (Netlify) vypisuje git branch řádek "(HEAD detached at ...)" - ten přeskočíme,
    // aby se číslice z hashe commitu nepletla do verze.
    const branches = runGit("git branch --format=%(refname:short)");
    const numbers = branches
      .split(/\r?\n/)
      .filter((name) => !name.startsWith("("))
      .map(numberFromName)
      .filter((value) => value !== null);
    if (numbers.length > 0) return String(Math.max(...numbers));

    const history = numberFromHistory();
    if (history !== null) return String(history);
  } catch {
    // Git není k dispozici (například build bez repozitáře).
  }

  return "???";
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
