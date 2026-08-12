#!/usr/bin/env node
// bin/oh-my-opencode.js
// Simplified wrapper: runs the CLI via bun (no platform binary needed)

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliEntry = join(__dirname, "..", "dist", "cli", "index.js");

// Determine invocation name from argv[1] basename
const invocationName = process.env.OMO_INVOCATION_NAME
  || (process.argv[1] ? process.argv[1].split(/[/\\]/).pop() : "omol");

process.env.OMO_INVOCATION_NAME = invocationName;

// Try platform binary first (optional), fall back to bun
function tryPlatformBinary() {
  try {
    const platformBin = join(__dirname, "platform-binary.js");
    if (!existsSync(platformBin)) return null;
    // Legacy platform binary detection - skip if not available
    return null;
  } catch {
    return null;
  }
}

// Run CLI via bun (requires bun installed)
const child = spawnSync("bun", [cliEntry, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    OMO_INVOCATION_NAME: invocationName,
    OMO_WRAPPER_PACKAGE_ROOT: join(__dirname, ".."),
  },
});

process.exit(child.status ?? 1);
