import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CANDIDATE_FILES = [
  ".env",
  "clone.env",
  "supabase-vps/.env",
  "supabase-vps/docker-compose.yml",
  "deploy.bat",
  "deploy_function.py",
  "migrate.js",
];

const FORBIDDEN_PATTERNS = [
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*.+/i,
  /SERVICE_ROLE_KEY\s*=\s*.+/i,
  /POSTGRES_PASSWORD\s*=\s*.+/i,
  /JWT_SECRET\s*=\s*.+/i,
  /SUPABASE_ACCESS_TOKEN\s*=\s*.+/i,
  /sb_service_role_/i,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/,
];

const ALLOWLIST_PATTERNS = [
  /SUPABASE_SERVICE_ROLE_KEY\b/i,
  /SERVICE_ROLE_KEY\b/i,
  /SUPABASE_ACCESS_TOKEN\b/i,
  /JWT_SECRET\b/i,
  /POSTGRES_PASSWORD\b/i,
  /sb_publishable_/i,
  /your-super-secret-jwt-token/i,
  /seu_token_aqui/i,
];

function shouldIgnoreLine(line) {
  return ALLOWLIST_PATTERNS.some((pattern) => pattern.test(line));
}

const findings = [];

for (const relPath of CANDIDATE_FILES) {
  const absPath = path.join(ROOT, relPath);
  if (!fs.existsSync(absPath)) continue;

  const content = fs.readFileSync(absPath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (shouldIgnoreLine(line)) return;

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        findings.push(`${relPath}:${lineNumber} -> ${line.trim()}`);
        break;
      }
    }
  });
}

if (findings.length > 0) {
  console.error("\n[SECURITY] Possiveis segredos encontrados:\n");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  console.error("\nCommit bloqueado. Remova/mascare os segredos antes de commitar.\n");
  process.exit(1);
}

console.log("[SECURITY] Check de segredos passou.");
