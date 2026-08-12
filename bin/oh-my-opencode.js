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

function supportsAvx2() {
  if (process.arch !== "x64") {
    return null;
  }

  if (process.env.OH_MY_OPENCODE_FORCE_BASELINE === "1") {
    return false;
  }

  if (process.platform === "linux") {
    try {
      const cpuInfo = readFileSync("/proc/cpuinfo", "utf8").toLowerCase();
      return cpuInfo.includes("avx2");
    } catch {
      return null;
    }
  }

  if (process.platform === "darwin") {
    const probe = spawnSync("sysctl", ["-n", "machdep.cpu.leaf7_features"], {
      encoding: "utf8",
    });

    if (probe.error || probe.status !== 0) {
      return null;
    }

    return probe.stdout.toUpperCase().includes("AVX2");
  }

  return null;
}

function getSignalExitCode(signal) {
  const signalCodeByName = {
    SIGINT: 2,
    SIGILL: 4,
    SIGKILL: 9,
    SIGTERM: 15,
  };

  return 128 + (signalCodeByName[signal] ?? 1);
}

function getPackageBaseName() {
  return resolvePlatformPackageBaseName(getWrapperPackageName());
}

function getWrapperPackageName() {
  try {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    return packageJson.name || "oh-my-opencode";
  } catch {
    return "oh-my-opencode";
  }
}

function getWrapperPackageRoot() {
  return fileURLToPath(new URL("..", import.meta.url));
}

function readInstallerCommand(args) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--platform" || arg === "--repo-root") {
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) continue;
    return arg;
  }
  return undefined;
}

function maybeRunLazyCodexNodeInstaller(invocationName) {
  if (invocationName !== "lazycodex" && invocationName !== "lazycodex-ai") return false;
  const command = readInstallerCommand(process.argv.slice(2));
  if (command !== "update" && command !== "uninstall") return false;

  const installerPath = fileURLToPath(new URL("../packages/omo-codex/scripts/install-local.mjs", import.meta.url));
  if (!existsSync(installerPath)) return false;

  const result = spawnSync(process.execPath, [installerPath, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: {
      ...process.env,
      OMO_INVOCATION_NAME: invocationName,
      OMO_WRAPPER_PACKAGE_ROOT: getWrapperPackageRoot(),
    },
  });
  if (result.signal) {
    process.exit(getSignalExitCode(result.signal));
  }
  process.exit(result.status ?? 1);
}

/**
 * Determine which bin name the user invoked us with (oh-my-opencode, oh-my-openagent, omo, lazycodex).
 * Propagated to the compiled CLI binary via OMO_INVOCATION_NAME so it can route accordingly
 * (e.g. `lazycodex` defaults to the Codex install flow).
 * @returns {string}
 */
function getInvocationName(wrapperPackageName) {
  if (process.env.OMO_INVOCATION_NAME) {
    return process.env.OMO_INVOCATION_NAME;
  }
  const wrapperBareName = getPackageBareName(wrapperPackageName);
  if (wrapperBareName === "lazycodex" || wrapperBareName === "lazycodex-ai") {
    return wrapperBareName;
  }
  const argv1 = process.argv[1] ?? "";
  if (!argv1) {
    return "oh-my-opencode";
  }
  return basename(argv1, ".js").replace(/\.exe$/, "");
}

function main() {
  const { platform, arch } = process;
  const libcFamily = getLibcFamily();
  const wrapperPackageName = getWrapperPackageName();
  const invocationName = getInvocationName(wrapperPackageName);
  maybeRunLazyCodexNodeInstaller(invocationName);

  const packageBaseName = resolvePlatformPackageBaseName(wrapperPackageName);
  const avx2Supported = supportsAvx2();
  
  let packageCandidates;
  try {
    packageCandidates = getPlatformPackageCandidates({
      platform,
      arch,
      libcFamily,
      preferBaseline: avx2Supported === false,
      packageBaseName,
    });
  } catch (error) {
    console.error(`\noh-my-opencode: ${error.message}\n`);
    process.exit(1);
  }

  const resolvedBinaries = packageCandidates
    .map((pkg) => {
      try {
        return { pkg, binPath: require.resolve(getBinaryPath(pkg, platform)) };
      } catch {
        return null;
      }
    })
    .filter((entry) => entry !== null);

  if (resolvedBinaries.length === 0) {
    console.error(`\noh-my-opencode: Platform binary not installed.`);
    console.error(`\nYour platform: ${platform}-${arch}${libcFamily === "musl" ? "-musl" : ""}`);
    console.error(`Expected packages (in order): ${packageCandidates.join(", ")}`);
    console.error(`\nTo fix, run:`);
    console.error(`  npm install ${packageCandidates[0]}\n`);
    process.exit(1);
  }

  const childEnv = {
    ...process.env,
    OMO_INVOCATION_NAME: invocationName,
    OMO_WRAPPER_PACKAGE_ROOT: join(__dirname, ".."),
  },
});

process.exit(child.status ?? 1);
