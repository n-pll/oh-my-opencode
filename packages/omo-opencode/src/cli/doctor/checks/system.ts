import { existsSync, readFileSync } from "node:fs"

import { MIN_OPENCODE_VERSION, CHECK_IDS, CHECK_NAMES } from "../framework/constants"
import type { CheckResult, DoctorIssue, SystemInfo } from "../framework/types"
import { findOpenCodeBinary, getOpenCodeVersion, compareVersions } from "./system-binary"
import { getPluginInfo } from "./system-plugin"
import { getLatestPluginVersion, getLoadedPluginVersion, getSuggestedInstallTag } from "./system-loaded-version"
import { parseJsonc } from "../../../shared/jsonc-parser"
import { ACCEPTED_PACKAGE_NAMES, PUBLISHED_PACKAGE_NAME, PLUGIN_NAME, LEGACY_PLUGIN_NAME } from "../../../shared/plugin-identity"
import { t } from "../../../shared/i18n"

const runtime = globalThis as typeof globalThis & { Bun?: { version?: string } }

interface SystemCheckDeps {
  findOpenCodeBinary: typeof findOpenCodeBinary
  getOpenCodeVersion: typeof getOpenCodeVersion
  compareVersions: typeof compareVersions
  getPluginInfo: typeof getPluginInfo
  getLoadedPluginVersion: typeof getLoadedPluginVersion
  getLatestPluginVersion: typeof getLatestPluginVersion
  getSuggestedInstallTag: typeof getSuggestedInstallTag
  configExists: typeof existsSync
  readConfigFile: (path: string) => string
  parseConfigContent: (content: string) => unknown
}

const defaultDeps: SystemCheckDeps = {
  findOpenCodeBinary,
  getOpenCodeVersion,
  compareVersions,
  getPluginInfo,
  getLoadedPluginVersion,
  getLatestPluginVersion,
  getSuggestedInstallTag,
  configExists: existsSync,
  readConfigFile: (path) => readFileSync(path, "utf-8"),
  parseConfigContent: (content) => parseJsonc<Record<string, unknown>>(content),
}

const BUN_POSTINSTALL_HELPER_PACKAGE_NAME = "@code-yeongyu/comment-checker"

function isConfigValid(configPath: string | null, deps: SystemCheckDeps): boolean {
  if (!configPath) return true
  if (!deps.configExists(configPath)) return false

  try {
    deps.parseConfigContent(deps.readConfigFile(configPath))
    return true
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }

    return false
  }
}

function getResultStatus(issues: DoctorIssue[]): CheckResult["status"] {
  if (issues.some((issue) => issue.severity === "error")) return "fail"
  if (issues.some((issue) => issue.severity === "warning")) return "warn"
  return "pass"
}

function buildMessage(status: CheckResult["status"], issues: DoctorIssue[]): string {
  if (status === "pass") return t("cli.doctor.system.passed")
  if (status === "fail") return t("cli.doctor.system.issueDetected", { count: issues.length })
  return t("cli.doctor.system.warningDetected", { count: issues.length })
}

function getLoadedPackageName(installedPackagePath: string): string {
  const parts = installedPackagePath.split(/[\\/]/)
  const nodeModulesIndex = parts.lastIndexOf("node_modules")
  const packageName = nodeModulesIndex >= 0 ? parts[nodeModulesIndex + 1] : undefined
  return packageName !== undefined && ACCEPTED_PACKAGE_NAMES.some((acceptedName) => acceptedName === packageName)
    ? packageName
    : PUBLISHED_PACKAGE_NAME
}

export async function gatherSystemInfo(deps: SystemCheckDeps = defaultDeps): Promise<SystemInfo> {
  const [binaryInfo, pluginInfo] = await Promise.all([
    deps.findOpenCodeBinary(),
    Promise.resolve(deps.getPluginInfo()),
  ])
  const loadedInfo = deps.getLoadedPluginVersion()

  const opencodeVersion = binaryInfo ? await deps.getOpenCodeVersion(binaryInfo.path) : null
  const pluginVersion = pluginInfo.pinnedVersion ?? loadedInfo.expectedVersion ?? loadedInfo.loadedVersion

  return {
    opencodeVersion,
    opencodePath: binaryInfo?.path ?? null,
    pluginVersion,
    loadedVersion: loadedInfo.loadedVersion,
    bunVersion: runtime.Bun?.version ?? "unavailable",
    configPath: pluginInfo.configPath,
    configValid: isConfigValid(pluginInfo.configPath, deps),
    isLocalDev: pluginInfo.isLocalDev,
  }
}

export async function checkSystem(deps: SystemCheckDeps = defaultDeps): Promise<CheckResult> {
  const [systemInfo, pluginInfo] = await Promise.all([
    gatherSystemInfo(deps),
    Promise.resolve(deps.getPluginInfo()),
  ])
  const loadedInfo = deps.getLoadedPluginVersion()
  const latestVersion = await deps.getLatestPluginVersion(systemInfo.loadedVersion)
  const installTag = deps.getSuggestedInstallTag(systemInfo.loadedVersion)
  const issues: DoctorIssue[] = []

  if (!systemInfo.opencodePath) {
    issues.push({
      title: t("cli.doctor.system.opencodeNotFound.title"),
      description: t("cli.doctor.system.opencodeNotFound.description"),
      fix: t("cli.doctor.system.opencodeNotFound.fix"),
      severity: "error",
      affects: ["doctor", "run"],
    })
  }

  if (
    systemInfo.opencodeVersion &&
    !deps.compareVersions(systemInfo.opencodeVersion, MIN_OPENCODE_VERSION)
  ) {
    issues.push({
      title: t("cli.doctor.system.opencodeBelowMin.title"),
      description: t("cli.doctor.system.opencodeBelowMin.description", { detected: systemInfo.opencodeVersion, required: MIN_OPENCODE_VERSION }),
      fix: t("cli.doctor.system.opencodeBelowMin.fix"),
      severity: "warning",
      affects: ["tooling", "doctor"],
    })
  }

  if (!pluginInfo.registered) {
    issues.push({
      title: t("cli.doctor.system.pluginNotRegistered.title", { pluginName: PLUGIN_NAME }),
      description: t("cli.doctor.system.pluginNotRegistered.description"),
      fix: t("cli.doctor.system.pluginNotRegistered.fix", { packageName: PUBLISHED_PACKAGE_NAME }),
      severity: "error",
      affects: ["all agents"],
    })
  }

  if (pluginInfo.entry && !pluginInfo.isLocalDev) {
    const isLegacyName = pluginInfo.entry === LEGACY_PLUGIN_NAME
      || pluginInfo.entry.startsWith(`${LEGACY_PLUGIN_NAME}@`)

    if (isLegacyName) {
      const suggestedEntry = pluginInfo.entry.replace(LEGACY_PLUGIN_NAME, PLUGIN_NAME)
      issues.push({
        title: t("cli.doctor.system.legacyName.title"),
        description: t("cli.doctor.system.legacyName.description", { legacyName: LEGACY_PLUGIN_NAME, pluginName: PLUGIN_NAME }),
        fix: t("cli.doctor.system.legacyName.fix", { entry: pluginInfo.entry, suggested: suggestedEntry }),
        severity: "warning",
        affects: ["plugin loading"],
      })
    }
  }

  if (loadedInfo.expectedVersion && loadedInfo.loadedVersion && loadedInfo.expectedVersion !== loadedInfo.loadedVersion) {
    issues.push({
      title: t("cli.doctor.system.versionMismatch.title"),
      description: t("cli.doctor.system.versionMismatch.description", { expected: loadedInfo.expectedVersion, loaded: loadedInfo.loadedVersion }),
      fix: t("cli.doctor.system.versionMismatch.fix", { cacheDir: loadedInfo.cacheDir }),
      severity: "warning",
      affects: ["plugin loading"],
    })
  }

  if (
    systemInfo.loadedVersion &&
    latestVersion &&
    !deps.compareVersions(systemInfo.loadedVersion, latestVersion)
  ) {
    const loadedPackageName = getLoadedPackageName(loadedInfo.installedPackagePath)
    issues.push({
      title: t("cli.doctor.system.outdated.title"),
      description: t("cli.doctor.system.outdated.description", { loaded: systemInfo.loadedVersion, latest: latestVersion }),
      fix: t("cli.doctor.system.outdated.fix", { cacheDir: loadedInfo.cacheDir, packageName: loadedPackageName, installTag, helperPackage: BUN_POSTINSTALL_HELPER_PACKAGE_NAME }),
      severity: "warning",
      affects: ["plugin features"],
    })
  }

  const status = getResultStatus(issues)
  return {
    name: CHECK_NAMES[CHECK_IDS.SYSTEM],
    status,
    message: buildMessage(status, issues),
    details: [
      systemInfo.opencodeVersion ? t("cli.doctor.system.detail.opencode", { version: systemInfo.opencodeVersion }) : t("cli.doctor.system.detail.opencodeNotDetected"),
      t("cli.doctor.system.detail.pluginExpected", { version: systemInfo.pluginVersion ?? t("common.unknown") }),
      t("cli.doctor.system.detail.pluginLoaded", { version: systemInfo.loadedVersion ?? t("common.unknown") }),
      t("cli.doctor.system.detail.bun", { version: systemInfo.bunVersion ?? t("common.unknown") }),
    ],
    issues,
  }
}
