// Runs the private (3000) and public (3001) apps together.
// Usage: node scripts/run-all.mjs dev|start
import { spawn } from "node:child_process";

const mode = process.argv[2] ?? "dev";
if (!["dev", "start"].includes(mode)) {
  console.error("Usage: node scripts/run-all.mjs dev|start");
  process.exit(1);
}

const apps = [
  { name: "private", port: 3000 },
  { name: "public", port: 3001 },
];

const children = apps.map(({ name, port }) => {
  const child = spawn("npm", ["--prefix", name, "run", mode, "--", "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });
  const tag = `[${name}] `;
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (d) => process.stdout.write(String(d).replace(/^(?=.)/gm, tag)));
  }
  child.on("exit", (code) => {
    console.log(`${tag}exited with code ${code}`);
    shutdown(code ?? 0);
  });
  return child;
});

let closing = false;
function shutdown(code) {
  if (closing) return;
  closing = true;
  for (const c of children) c.kill();
  process.exit(code);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
