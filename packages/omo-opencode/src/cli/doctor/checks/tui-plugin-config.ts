import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import {
  ACCEPTED_PACKAGE_NAMES,
  LEGACY_PLUGIN_NAME,
  PLUGIN_NAME,
  getOpenCodeConfigDir,
  getOpenCodeConfigPaths,
  log,
  parseJsonc,
} from "../../../shared"
import { CHECK_IDS, CHECK_NAMES } from "../framework/constants"
import type { CheckResult, DoctorIssue } from "../framework/types"
import { t } from "../../../shared/i18n"

const TUI_SUBPATH = "tui"
const TUI_EXPORT_SUBPATH = `./${TUI_SUBPATH}`

interface OpenCodeConfigShape {
  plugin?: (string | [string, unknown])[]
}

interface TuiConfigShape {
  plugin?: (string | [string, unknown])[]
}

interface ServerPluginInfo {
  registered: boolean
  configPath: string | null
  entry: string | null
  packageExportsTui: boolean | null
}

interface TuiPluginInfo {
  registered: boolean
  configPath: string | null
  exists: boolean
  hasPackageTuiEntry: boolean
  hasNamedTuiEntry: boolean
  hasCanonicalNamedTuiEntry: boolean
}

function fileEntryPackageJsonPath(entry: string): string {
  let path = entry.slice("file:".length)
  if (path.startsWith("//")) path = path.slice(2)
  return join(path, "package.json")
}

function packageJsonExportsTui(pkgJsonPath: string): boolean | null {
  if (!existsSync(pkgJsonPath)) return null

  try {
    const parsed = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as { exports?: unknown }
    if (parsed.exports === undefined) return null
    if (typeof parsed.exports === "string") return false
    if (parsed.exports == null || typeof parsed.exports !== "object" || Array.isArray(parsed.exports)) return null
    return Object.hasOwn(parsed.exports, TUI_EXPORT_SUBPATH)
  } catch (error) {
    log("[tui-plugin-config] Failed to inspect package exports", {
      pkgJsonPath,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

function packageNameFromServerEntry(entry: unknown): string | null {
  if (typeof entry === "string" && (entry === PLUGIN_NAME || entry.startsWith(`${PLUGIN_NAME}@`))) return PLUGIN_NAME
  if (typeof entry === "string" && (entry === LEGACY_PLUGIN_NAME || entry.startsWith(`${LEGACY_PLUGIN_NAME}@`))) return LEGACY_PLUGIN_NAME
  return null
}

function isPackagePluginEntry(entry: unknown): boolean {
  return packageNameFromServerEntry(entry) !== null
}

function packageExportsTuiForServerEntry(entry: unknown): boolean | null {
  if (typeof entry === "string" && entry.startsWith("file:")) return packageJsonExportsTui(fileEntryPackageJsonPath(entry))

  const packageName = packageNameFromServerEntry(entry)
  if (packageName === null) return null

  return packageJsonExportsTui(join(getOpenCodeConfigDir({ binary: "opencode" }), "node_modules", packageName, "package.json"))
}

export function isOurFilePluginEntry(entry: unknown): boolean {
  if (typeof entry !== "string" || !entry.startsWith("file:")) return false
  try {
    const pkgJsonPath = fileEntryPackageJsonPath(entry)
    if (!existsSync(pkgJsonPath)) return false
    const parsed = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as { name?: unknown }
    return typeof parsed.name === "string"
      && (ACCEPTED_PACKAGE_NAMES as readonly string[]).includes(parsed.name)
  } catch (error) {
    log("[tui-plugin-config] Failed to inspect file plugin package", {
      entry,
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}

export function isServerPluginEntry(entry: unknown): entry is string {
  if (typeof entry === "string" && (entry === PLUGIN_NAME || entry.startsWith(`${PLUGIN_NAME}@`))) return true
  if (typeof entry === "string" && (entry === LEGACY_PLUGIN_NAME || entry.startsWith(`${LEGACY_PLUGIN_NAME}@`))) return true
  if (typeof entry === "string" && entry.startsWith("file:") && isOurFilePluginEntry(entry)) return true
  return false
}

export function isTuiPluginEntry(entry: unknown): boolean {
  return typeof entry === "string" && (isPackagePluginEntry(entry) || (entry.startsWith("file:") && isOurFilePluginEntry(entry)))
}

export function isNamedTuiPluginEntry(entry: unknown): boolean {
  const canonicalPrefix = `${PLUGIN_NAME}/${TUI_SUBPATH}`
  const legacyPrefix = `${LEGACY_PLUGIN_NAME}/${TUI_SUBPATH}`
  return typeof entry === "string"
    && (entry === canonicalPrefix
      || entry.startsWith(`${canonicalPrefix}@`)
      || entry === legacyPrefix
      || entry.startsWith(`${legacyPrefix}@`))
}

function isCanonicalNamedTuiPluginEntry(entry: unknown): boolean {
  const canonicalPrefix = `${PLUGIN_NAME}/${TUI_SUBPATH}`
  return typeof entry === "string" && (entry === canonicalPrefix || entry.startsWith(`${canonicalPrefix}@`))
}

export function detectServerPluginRegistration(): ServerPluginInfo {
  const paths = getOpenCodeConfigPaths({ binary: "opencode", version: null })
  const configPath = existsSync(paths.configJsonc)
    ? paths.configJsonc
    : existsSync(paths.configJson)
      ? paths.configJson
      : null

  if (!configPath) {
    return { registered: false, configPath: null, entry: null, packageExportsTui: null }
  }

  try {
    const parsed = parseJsonc<OpenCodeConfigShape>(readFileSync(configPath, "utf-8"))
    const plugins = parsed.plugin ?? []
    const serverEntry = plugins.find(isServerPluginEntry)
    return {
      registered: serverEntry !== undefined,
      configPath,
      entry: serverEntry ?? null,
      packageExportsTui: serverEntry === undefined ? null : packageExportsTuiForServerEntry(serverEntry),
    }
  } catch (error) {
    log("[tui-plugin-config] Failed to inspect opencode plugin config", {
      configPath,
      error: error instanceof Error ? error.message : String(error),
    })
    return { registered: false, configPath, entry: null, packageExportsTui: null }
  }
}

export function detectTuiPluginRegistration(): TuiPluginInfo {
  const tuiJsonPath = join(getOpenCodeConfigDir({ binary: "opencode" }), "tui.json")
  if (!existsSync(tuiJsonPath)) {
    return {
      registered: false,
      configPath: tuiJsonPath,
      exists: false,
      hasPackageTuiEntry: false,
      hasNamedTuiEntry: false,
      hasCanonicalNamedTuiEntry: false,
    }
  }

  try {
    const parsed = parseJsonc<TuiConfigShape>(readFileSync(tuiJsonPath, "utf-8"))
    const plugins = parsed.plugin ?? []
    return {
      registered: plugins.some(isTuiPluginEntry),
      configPath: tuiJsonPath,
      exists: true,
      hasPackageTuiEntry: plugins.some(isPackagePluginEntry),
      hasNamedTuiEntry: plugins.some(isNamedTuiPluginEntry),
      hasCanonicalNamedTuiEntry: plugins.some(isCanonicalNamedTuiPluginEntry),
    }
  } catch (error) {
    log("[tui-plugin-config] Failed to inspect TUI plugin config", {
      configPath: tuiJsonPath,
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      registered: false,
      configPath: tuiJsonPath,
      exists: true,
      hasPackageTuiEntry: false,
      hasNamedTuiEntry: false,
      hasCanonicalNamedTuiEntry: false,
    }
  }
}

export async function checkTuiPluginConfig(): Promise<CheckResult> {
  const name = CHECK_NAMES[CHECK_IDS.TUI_PLUGIN]
  const server = detectServerPluginRegistration()
  const tui = detectTuiPluginRegistration()
  const issues: DoctorIssue[] = []
  const details: string[] = []

  if (server.configPath) details.push(t("cli.doctor.tuiPlugin.detail.opencode", { path: server.configPath }))
  if (tui.configPath) details.push(t("cli.doctor.tuiPlugin.detail.tui", { path: tui.configPath }))

  if (!server.registered && !tui.registered) {
    return {
      name,
      status: "skip",
      message: t("cli.doctor.tuiPlugin.skip"),
      details: details.length > 0 ? details : undefined,
      issues,
    }
  }

  if (tui.hasNamedTuiEntry) {
    const exportStatus = server.packageExportsTui === null
      ? t("cli.doctor.tuiPlugin.exportStatus.mayExpose", { tuiExport: TUI_EXPORT_SUBPATH })
      : server.packageExportsTui
        ? t("cli.doctor.tuiPlugin.exportStatus.doesExport", { tuiExport: TUI_EXPORT_SUBPATH })
        : t("cli.doctor.tuiPlugin.exportStatus.doesNotExport", { tuiExport: TUI_EXPORT_SUBPATH })
    const desiredEntry = server.entry ?? PLUGIN_NAME
    issues.push({
      title: t("cli.doctor.tuiPlugin.unresolvable.title"),
      description: t("cli.doctor.tuiPlugin.unresolvable.description", {
        pluginName: PLUGIN_NAME, tuiSubpath: TUI_SUBPATH, legacyName: LEGACY_PLUGIN_NAME,
        exportStatus, desiredEntry,
      }),
      fix: t("cli.doctor.tuiPlugin.unresolvable.fix", {
        pluginName: PLUGIN_NAME, tuiSubpath: TUI_SUBPATH, legacyName: LEGACY_PLUGIN_NAME,
        configPath: tui.configPath, desiredEntry,
      }),
      affects: ["TUI startup", "plugin loading"],
      severity: "warning",
    })
    return {
      name,
      status: "warn",
      message: t("cli.doctor.tuiPlugin.unresolvable.message"),
      details: details.length > 0 ? details : undefined,
      issues,
    }
  }

  if (server.registered && server.packageExportsTui === false && tui.hasPackageTuiEntry) {
    issues.push({
      title: t("cli.doctor.tuiPlugin.noExport.title"),
      description: t("cli.doctor.tuiPlugin.noExport.description", { entry: server.entry ?? PLUGIN_NAME, tuiExport: TUI_EXPORT_SUBPATH }),
      fix: t("cli.doctor.tuiPlugin.noExport.fix", { entry: server.entry ?? PLUGIN_NAME, configPath: tui.configPath, tuiExport: TUI_EXPORT_SUBPATH }),
      affects: ["TUI sidebar", "TUI commands"],
      severity: "warning",
    })
    return {
      name,
      status: "warn",
      message: t("cli.doctor.tuiPlugin.noExport.message"),
      details: details.length > 0 ? details : undefined,
      issues,
    }
  }

  if (server.registered && !tui.registered) {
    if (server.packageExportsTui === false) {
      return {
        name,
        status: "pass",
        message: t("cli.doctor.tuiPlugin.tuiSubpathNotShipped"),
        details: details.length > 0 ? details : undefined,
        issues,
      }
    }

    issues.push({
      title: t("cli.doctor.tuiPlugin.tuiMissing.title"),
      description: t("cli.doctor.tuiPlugin.tuiMissing.description", { entry: server.entry ?? PLUGIN_NAME }),
      fix: t("cli.doctor.tuiPlugin.tuiMissing.fix", { entry: server.entry ?? PLUGIN_NAME, configPath: tui.configPath }),
      affects: ["TUI sidebar", "TUI commands"],
      severity: "warning",
    })
    return {
      name,
      status: "warn",
      message: t("cli.doctor.tuiPlugin.tuiMissing.message"),
      details: details.length > 0 ? details : undefined,
      issues,
    }
  }

  if (!server.registered && tui.registered) {
    issues.push({
      title: t("cli.doctor.tuiPlugin.serverMissing.title"),
      description: t("cli.doctor.tuiPlugin.serverMissing.description", { pluginName: PLUGIN_NAME }),
      fix: t("cli.doctor.tuiPlugin.serverMissing.fix", { pluginName: PLUGIN_NAME, configPath: server.configPath ?? "opencode.json" }),
      affects: ["tool dispatch", "hook execution", "SDK integration"],
      severity: "warning",
    })
    return {
      name,
      status: "warn",
      message: t("cli.doctor.tuiPlugin.serverMissing.message"),
      details: details.length > 0 ? details : undefined,
      issues,
    }
  }

  return {
    name,
    status: "pass",
    message: t("cli.doctor.tuiPlugin.bothRegistered"),
    details: details.length > 0 ? details : undefined,
    issues,
  }
}
