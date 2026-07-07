import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join, resolve } from "node:path"
import { resolveCodexInstallerBinDir } from "../../install-codex/install-codex"
import type { CheckResult, DoctorIssue } from "../framework/types"
import { t } from "../../../shared/i18n"

const RUNTIME_WRAPPER_MARKER = "OMO_GENERATED_RUNTIME_WRAPPER"
const CHECK_NAME = "codex-runtime-wrapper"
const REINSTALL_COMMAND = "npx --yes lazycodex-ai@latest install --no-tui"

export interface CodexRuntimeWrapperDoctorDeps {
  readonly binDir?: string
  readonly codexHome?: string
  readonly platform?: NodeJS.Platform
}

export async function checkCodexRuntimeWrapper(deps: CodexRuntimeWrapperDoctorDeps = {}): Promise<CheckResult> {
  const codexHome = resolve(deps.codexHome ?? process.env.CODEX_HOME ?? join(homedir(), ".codex"))
  const binDir = resolveCodexInstallerBinDir({ binDir: deps.binDir, codexHome, env: process.env })
  const platform = deps.platform ?? process.platform
  const wrapperPath = join(binDir, platform === "win32" ? "omo.cmd" : "omo")
  const wrapper = await readRuntimeWrapper(wrapperPath)
  const issues: DoctorIssue[] = []

  if (wrapper?.includes(RUNTIME_WRAPPER_MARKER) === true) {
    const targetPath = parseRuntimeTargetPath(wrapper)
    if (targetPath !== null && !existsSync(targetPath)) {
      issues.push({
        title: t("cli.doctor.codexRuntime.title"),
        description: t("cli.doctor.codexRuntime.description", { wrapperPath, targetPath }),
        fix: t("cli.doctor.codexRuntime.fix", { command: REINSTALL_COMMAND }),
        severity: "warning",
        affects: ["ulw-loop"],
      })
    }
  }

  return {
    name: CHECK_NAME,
    status: issues.length > 0 ? "warn" : "pass",
    message: issues.length > 0 ? t("cli.doctor.codexRuntime.issueDetected", { count: issues.length }) : t("cli.doctor.codexRuntime.passed"),
    details: [t("cli.doctor.codexRuntime.detail.wrapper", { path: wrapperPath })],
    issues,
  }
}

async function readRuntimeWrapper(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8")
  } catch (error) {
    if (error instanceof Error) return null
    throw error
  }
}

function parseRuntimeTargetPath(wrapper: string): string | null {
  const posixMatch = wrapper.match(/exec "\$BUN_BINARY" "([^"]+)" "\$@"/)
  if (posixMatch?.[1] !== undefined) return posixMatch[1]
  const windowsMatch = wrapper.match(/"%+BUN_BINARY%+"\s+"([^"]+)"\s+%+\*/)
  return windowsMatch?.[1] ?? null
}
