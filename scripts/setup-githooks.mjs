import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const hooksDir = path.join(root, ".githooks");
const preCommitPath = path.join(hooksDir, "pre-commit");

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const preCommitScript = `#!/bin/sh
npm run check:secrets
status=$?
if [ $status -ne 0 ]; then
  exit $status
fi

npm run lint
`;

fs.writeFileSync(preCommitPath, preCommitScript, { encoding: "utf8" });

try {
  fs.chmodSync(preCommitPath, 0o755);
} catch {
  // Windows pode ignorar permissão POSIX
}

try {
  execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
  console.log("[GITHOOKS] pre-commit configurado com sucesso.");
} catch {
  console.warn("[GITHOOKS] Nao foi possivel configurar automaticamente core.hooksPath.");
  console.warn("Execute manualmente: git config core.hooksPath .githooks");
}
