#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exe = join(__dirname, "omol.exe");

if (!existsSync(exe)) {
  console.error("omol binary not found: " + exe);
  process.exit(1);
}

const invocationName = process.env.OMO_INVOCATION_NAME || "omol";

const child = spawnSync(exe, process.argv.slice(2), {
  stdio: "inherit",
  env: {
    ...process.env,
    OMO_INVOCATION_NAME: invocationName,
  },
});

process.exit(child.status ?? 1);
