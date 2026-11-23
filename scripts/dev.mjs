import { spawn, execSync } from "node:child_process";
import path from "node:path";

// Menjalankan backend (port internal) dan frontend (port publik) sekaligus: npm run dev.
const frontendPort = process.env.PORT || "8080";
const backendPort = process.env.BACKEND_PORT || "4000";
const frontendChildPort = frontendPort;
const children = [];
let closing = false;

function shutdown(code) {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 500);
}

function run(name) {
  let cmd = "npm";
  let args = ["run", "dev", "--workspace", name];
  let cwd = process.cwd();
  const child = spawn(cmd, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
    env: {
      ...process.env,
      PORT: name === "backend" ? backendPort : frontendChildPort,
      BACKEND_URL: "http://127.0.0.1:" + backendPort,
    },
  });
  const prefix = "[" + name + "] ";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      for (const line of chunk.toString().split(/\r?\n/)) {
        if (line) console.log(prefix + line);
      }
    });
  }
  child.on("error", (error) => {
    console.error(prefix + "gagal dijalankan: " + error.message);
    shutdown(1);
  });
  child.on("exit", (code) => {
    console.log(prefix + "berhenti dengan kode " + code);
    shutdown(code === 0 ? 0 : 1);
  });
  children.push(child);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("backend");
run("frontend");
