import { createServer, preview } from "vite";
import { spawn } from "node:child_process";
import {
  mkdir,
  readFile,
  writeFile,
  open,
  unlink,
  access,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
const root = path.resolve(import.meta.dirname, "..");
const runtime = path.join(root, ".runtime");
const production = process.argv.includes("--production");
const stateFile = path.join(
  runtime,
  production ? "production-preview.json" : "preview.json",
);
const instance = randomUUID();
await mkdir(runtime, { recursive: true });
if (process.argv.includes("--background")) {
  let state;
  try {
    state = JSON.parse(await readFile(stateFile, "utf8"));
  } catch {}
  if (state) {
    try {
      process.kill(state.pid, 0);
      const response = await fetch(`${state.url}__lab_health`);
      if (response.headers.get("x-lab-process") === String(state.pid)) {
        console.log(`Preview already running: ${state.url}`);
        process.exit(0);
      }
    } catch {}
  }
  await unlink(stateFile).catch(() => {});
  const log = await open(path.join(runtime, "preview.log"), "a");
  const child = spawn(
    process.execPath,
    [
      path.join(root, "scripts/serve.mjs"),
      ...(production ? ["--production"] : []),
    ],
    {
      cwd: root,
      detached: true,
      stdio: ["ignore", log.fd, log.fd],
      env: process.env,
    },
  );
  child.unref();
  await log.close();
  for (let i = 0; i < 100; i++) {
    try {
      const ready = JSON.parse(await readFile(stateFile, "utf8"));
      if (ready.pid === child.pid) {
        const response = await fetch(`${ready.url}__lab_health`);
        if (response.headers.get("x-lab-process") === String(child.pid)) {
          console.log(
            `Preview running: ${ready.url} (PID ${child.pid}). Stop: npm run stop`,
          );
          process.exit(0);
        }
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  try {
    process.kill(child.pid, "SIGTERM");
  } catch {}
  throw new Error("Preview startup failed. See .runtime/preview.log");
}
const port = Number(process.env.PORT || 4191);
if (production) await access(path.join(root, "dist/index.html"));
const health = {
  name: "lab-health",
  configureServer(server) {
    addHealth(server);
  },
  configurePreviewServer(server) {
    addHealth(server);
  },
};
function addHealth(server) {
  server.middlewares.use("/__lab_health", (_req, res) => {
    res.setHeader("x-lab-process", String(process.pid));
    res.setHeader("x-lab-instance", instance);
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({ project: "qquce-reconstruction-lab", pid: process.pid }),
    );
  });
}
const server = production
  ? await preview({
      configFile: false,
      root: path.join(root, "app"),
      plugins: [health],
      build: { outDir: path.join(root, "dist") },
      preview: { host: "127.0.0.1", port, strictPort: false },
    })
  : await createServer({
      configFile: false,
      root: path.join(root, "app"),
      plugins: [health],
      server: { host: "127.0.0.1", port, strictPort: false },
      appType: "spa",
    });
if (!production) await server.listen();
const url = server.resolvedUrls.local[0];
await writeFile(
  stateFile,
  JSON.stringify({ pid: process.pid, root, url, production, instance }),
);
console.log(`Independent assessment preview: ${url}`);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (production)
    await new Promise((resolve) => server.httpServer.close(resolve));
  else await server.close();
  try {
    const recorded = JSON.parse(await readFile(stateFile, "utf8"));
    if (recorded.pid === process.pid) await unlink(stateFile);
  } catch {}
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
