import { readFile, unlink } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
for (const name of ["preview.json", "production-preview.json"]) {
  const file = path.resolve(import.meta.dirname, "../.runtime/", name);
  try {
    const state = JSON.parse(await readFile(file, "utf8"));
    if (!Number.isInteger(state.pid) || state.pid < 2)
      throw new Error("Invalid process record");
    let command = "";
    try {
      command = execFileSync(
        "ps",
        ["-p", String(state.pid), "-o", "command="],
        {
          encoding: "utf8",
        },
      );
    } catch {}
    let sameInstance = false;
    if (state.instance) {
      try {
        const response = await fetch(`${state.url}__lab_health`, {
          signal: AbortSignal.timeout(2000),
        });
        sameInstance =
          response.headers.get("x-lab-instance") === state.instance &&
          response.headers.get("x-lab-process") === String(state.pid);
      } catch {}
    }
    if (
      command.includes(path.resolve(import.meta.dirname, "serve.mjs")) ||
      (command.includes("scripts/serve.mjs") && sameInstance)
    ) {
      process.kill(state.pid, "SIGTERM");
      console.log(`Stopped preview PID ${state.pid}`);
    } else
      console.log("Recorded preview is no longer running; no process stopped.");
    await unlink(file).catch(() => {});
  } catch (error) {
    if (error.code === "ENOENT") console.log("Preview is already stopped.");
    else throw error;
  }
}
