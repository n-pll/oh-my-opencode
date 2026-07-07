import { isPlainRecord } from "@oh-my-opencode/utils"
import { existsSync } from "node:fs"
import { lstat, readdir, readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { basename, join, resolve } from "node:path"
import { detectCodexInstallation, type CodexInstallationDetection } from "../../install-codex"
import { resolveCodexInstallerBinDir } from "../../install-codex/install-codex"
import { parseHookStateHeaderKey, splitTomlSections } from "../../install-codex/codex-config-toml-sections"
import { CHECK_IDS, CHECK_NAMES } from "../framework/constants"
import type { CheckResult, CodexConfigSummary, CodexDoctorSummary, DoctorIssue } from "../framework/types"
import packageJson from "../../../../package.json" with { type: "json" }
import { t } from "../../../shared/i18n"

type DetectCodexInstallation = () => Promise<CodexInstallationDetection>

export interface CodexDoctorDeps {
  readonly codexHome?: string
  readonly binDir?: string
  readonly detectCodexInstallation?: DetectCodexInstallation
  readonly installerVersion?: string
}

interface JsonRecord {
  readonly [key: string]: unknown
}

const MARKETPLACE_NAME = "sisyphuslabs"
const PLUGIN_NAME = "omo"
const COMPANION_PLUGIN_KEY = "codex@openai-codex"
const DEFAULT_PLUGIN_VERSION = "0.1.0"
const COMPANION_LIFECYCLE_EVENTS = new Set(["session_start", "stop"])
const CODEX_BIN_NAMES = [
  "omo",
  "omo-rules",
  "omo-lsp",
  "omo-comment-checker",
  "omo-ultrawork",
  "omo-start-work-continuation",
  "omo-telemetry",
  "omo-git-bash-hook",
] as const

export async function gatherCodexSummary(deps: CodexDoctorDeps = {}): Promise<CodexDoctorSummary> {
  const codexHome = resolve(deps.codexHome ?? process.env.CODEX_HOME ?? join(homedir(), ".codex"))
  const binDir = resolveCodexInstallerBinDir({ binDir: deps.binDir, codexHome, env: process.env })
  const detection = await (deps.detectCodexInstallation ?? detectCodexInstallation)()
  const pluginRoot = await resolveInstalledPluginRoot(codexHome)
  const manifest = pluginRoot === null ? null : await readJson(join(pluginRoot, ".codex-plugin", "plugin.json"))
  const installSnapshot = pluginRoot === null ? null : await readJson(join(pluginRoot, "lazycodex-install.json"))
  const configPath = join(codexHome, "config.toml")
  const pluginVersion = stringField(manifest, "version")

  return {
    codexPath: detection.found && "path" in detection ? detection.path : null,
    codexSource: detection.found ? detection.source : null,
    codexAppId: detection.found && "appId" in detection ? detection.appId : null,
    marketplaceName: MARKETPLACE_NAME,
    pluginName: PLUGIN_NAME,
    pluginVersion,
    pluginVersionStamped: pluginVersion !== null && pluginVersion !== DEFAULT_PLUGIN_VERSION,
    installerVersion: deps.installerVersion ?? packageJson.version,
    packageName: stringField(installSnapshot, "packageName"),
    packageVersion: stringField(installSnapshot, "version"),
    pluginRoot,
    configPath,
    config: await readCodexConfigSummary(configPath),
    linkedBins: await readLinkedBins(binDir),
    agents: await readLinkedAgents(codexHome),
  }
}

export async function checkCodex(deps: CodexDoctorDeps = {}): Promise<CheckResult> {
  const summary = await gatherCodexSummary(deps)
  const issues = buildCodexIssues(summary)
  const status = issues.some((issue) => issue.severity === "error") ? "fail" : issues.length > 0 ? "warn" : "pass"
  return {
    name: CHECK_NAMES[CHECK_IDS.CODEX],
    status,
    message: status === "pass" ? t("cli.doctor.codex.passed") : t("cli.doctor.codex.issueDetected", { count: issues.length }),
    details: [
      t("cli.doctor.codex.detail.codex", { value: summary.codexPath ?? summary.codexAppId ?? t("cli.doctor.codex.detail.codexNotDetected") }),
      t("cli.doctor.codex.detail.cli", { version: summary.installerVersion }),
      t("cli.doctor.codex.detail.marketplace", { name: summary.marketplaceName }),
      t("cli.doctor.codex.detail.plugin", { name: summary.pluginName, version: summary.pluginVersion ?? t("common.unknown"), suffix: summary.pluginVersionStamped ? "" : t("cli.doctor.codex.detail.pluginPlaceholder") }),
      t("cli.doctor.codex.detail.distribution", { name: summary.packageName ?? t("common.unknown"), version: summary.packageVersion ?? t("common.unknown") }),
      t("cli.doctor.codex.detail.config", { path: summary.configPath }),
      t("cli.doctor.codex.detail.enabledPlugin", { value: summary.config.pluginEnabled ? t("cli.doctor.codex.detail.enabledPluginValue") : t("common.missing") }),
      t("cli.doctor.codex.detail.companionPlugin", { value: formatCompanionPluginStatus(summary.config) }),
      t("cli.doctor.codex.detail.linkedBins", { value: summary.linkedBins.length > 0 ? summary.linkedBins.join(", ") : t("common.none") }),
      t("cli.doctor.codex.detail.agents", { value: summary.agents.length > 0 ? summary.agents.join(", ") : t("common.none") }),
    ],
    issues,
  }
}

function buildCodexIssues(summary: CodexDoctorSummary): DoctorIssue[] {
  const issues: DoctorIssue[] = []
  if (summary.codexPath === null && summary.codexAppId === null) {
    issues.push({
      title: t("cli.doctor.codex.notInstalled.title"),
      description: t("cli.doctor.codex.notInstalled.description"),
      fix: t("cli.doctor.codex.notInstalled.fix"),
      severity: "error",
      affects: ["codex"],
    })
  }
  if (summary.pluginRoot === null) {
    issues.push({
      title: t("cli.doctor.codex.pluginNotInstalled.title"),
      description: t("cli.doctor.codex.pluginNotInstalled.description", { path: join("plugins", "cache", MARKETPLACE_NAME, PLUGIN_NAME, DEFAULT_PLUGIN_VERSION) }),
      fix: t("cli.doctor.codex.fix.install"),
      severity: "error",
      affects: ["plugin loading"],
    })
  } else if (!summary.pluginVersionStamped) {
    issues.push({
      title: t("cli.doctor.codex.notStamped.title"),
      description: t("cli.doctor.codex.notStamped.description", { version: summary.pluginVersion ?? t("common.unknown"), noSnapshot: summary.packageVersion === null ? t("cli.doctor.codex.notStamped.noSnapshot") : "", installerVersion: summary.installerVersion }),
      fix: t("cli.doctor.codex.fix.install"),
      severity: "warning",
      affects: ["version reporting"],
    })
  }
  if (summary.pluginRoot !== null && !summary.linkedBins.includes("omo")) {
    issues.push({
      title: t("cli.doctor.codex.runtimeNotLinked.title"),
      description: t("cli.doctor.codex.runtimeNotLinked.description"),
      fix: t("cli.doctor.codex.fix.installLatest"),
      severity: "error",
      affects: ["ulw-loop"],
    })
  }
  if (!summary.config.pluginEnabled) {
    issues.push({
      title: t("cli.doctor.codex.pluginNotEnabled.title"),
      description: t("cli.doctor.codex.pluginNotEnabled.description"),
      fix: t("cli.doctor.codex.fix.install"),
      severity: "error",
      affects: ["plugin loading"],
    })
  }
  if (!summary.config.marketplaceConfigured) {
    issues.push({
      title: t("cli.doctor.codex.marketplaceNotConfigured.title"),
      description: t("cli.doctor.codex.marketplaceNotConfigured.description"),
      fix: t("cli.doctor.codex.fix.install"),
      severity: "error",
      affects: ["plugin loading"],
    })
  }
  if (!summary.config.pluginsFeatureEnabled || !summary.config.pluginHooksFeatureEnabled) {
    issues.push({
      title: t("cli.doctor.codex.featuresNotEnabled.title"),
      description: t("cli.doctor.codex.featuresNotEnabled.description"),
      fix: t("cli.doctor.codex.fix.install"),
      severity: "warning",
      affects: ["hooks"],
    })
  }
  if (summary.config.pluginEnabled && hasCompanionLifecycleSurface(summary.config)) {
    issues.push({
      title: t("cli.doctor.codex.companionConflict.title"),
      description: t("cli.doctor.codex.companionConflict.description", { surface: companionLifecycleSurfaceDescription(summary.config) }),
      fix: t("cli.doctor.codex.companionConflict.fix"),
      severity: "warning",
      affects: ["hooks", "plugin compatibility"],
    })
  }
  return issues
}

async function resolveInstalledPluginRoot(codexHome: string): Promise<string | null> {
  const pluginRoot = join(codexHome, "plugins", "cache", MARKETPLACE_NAME, PLUGIN_NAME)
  if (!existsSync(pluginRoot)) return null
  const versions = await readdir(pluginRoot, { withFileTypes: true })
  const candidates = versions.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(compareVersionsDescending)
  return candidates.length === 0 ? null : join(pluginRoot, candidates[0] ?? DEFAULT_PLUGIN_VERSION)
}

async function readCodexConfigSummary(configPath: string): Promise<CodexConfigSummary> {
  if (!existsSync(configPath)) {
    return {
      exists: false,
      marketplaceConfigured: false,
      pluginEnabled: false,
      pluginsFeatureEnabled: false,
      pluginHooksFeatureEnabled: false,
      companionPluginEnabled: false,
      companionLifecycleHookStateEvents: [],
    }
  }
  const content = await readFile(configPath, "utf8")
  return {
    exists: true,
    marketplaceConfigured: content.includes("[marketplaces.sisyphuslabs]"),
    pluginEnabled: settingEnabled(sectionBody(content, 'plugins."omo@sisyphuslabs"'), "enabled"),
    pluginsFeatureEnabled: featureEnabled(content, "plugins"),
    pluginHooksFeatureEnabled: featureEnabled(content, "plugin_hooks"),
    companionPluginEnabled: settingEnabled(sectionBody(content, `plugins.${JSON.stringify(COMPANION_PLUGIN_KEY)}`), "enabled"),
    companionLifecycleHookStateEvents: readCompanionLifecycleHookStateEvents(content),
  }
}

async function readLinkedBins(binDir: string): Promise<readonly string[]> {
  const linked: string[] = []
  for (const name of CODEX_BIN_NAMES) {
    if (await pathExists(join(binDir, process.platform === "win32" ? `${name}.cmd` : name))) linked.push(name)
  }
  return linked
}

async function readLinkedAgents(codexHome: string): Promise<readonly string[]> {
  const agentsDir = join(codexHome, "agents")
  if (!existsSync(agentsDir)) return []
  const entries = await readdir(agentsDir, { withFileTypes: true })
  return entries.filter((entry) => entry.isFile() || entry.isSymbolicLink()).map((entry) => basename(entry.name, ".toml")).sort()
}

async function readJson(path: string): Promise<JsonRecord | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, "utf8"))
    return isPlainRecord(parsed) ? parsed : null
  } catch (error) {
    if (error instanceof Error) return null
    throw error
  }
}

function stringField(record: JsonRecord | null, key: string): string | null {
  const value = record?.[key]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function featureEnabled(content: string, name: string): boolean {
  const features = sectionBody(content, "features")
  return settingEnabled(features, name)
}

function settingEnabled(content: string, name: string): boolean {
  return content.includes(`${name} = true`)
}

function hasCompanionLifecycleSurface(config: CodexConfigSummary): boolean {
  return config.companionPluginEnabled || config.companionLifecycleHookStateEvents.length > 0
}

function companionLifecycleSurfaceDescription(config: CodexConfigSummary): string {
  const states = config.companionLifecycleHookStateEvents
  const stateText = states.length > 0
    ? t("cli.doctor.codex.companionSurface.trustedState", { events: formatCompanionLifecycleEvents(states) })
    : t("cli.doctor.codex.companionSurface.noState")
  const pluginText = config.companionPluginEnabled
    ? t("cli.doctor.codex.companionSurface.pluginEnabled", { key: COMPANION_PLUGIN_KEY })
    : t("cli.doctor.codex.companionSurface.pluginDisabled", { key: COMPANION_PLUGIN_KEY })
  return t("cli.doctor.codex.companionSurface.summary", { plugin: pluginText, state: stateText })
}

function formatCompanionPluginStatus(config: CodexConfigSummary): string {
  if (config.companionPluginEnabled) {
    const suffix = config.companionLifecycleHookStateEvents.length > 0
      ? t("cli.doctor.codex.companionStatus.hookTrustSuffix", { events: formatCompanionLifecycleEvents(config.companionLifecycleHookStateEvents) })
      : ""
    return t("cli.doctor.codex.companionStatus.enabled", { key: COMPANION_PLUGIN_KEY, suffix })
  }
  if (config.companionLifecycleHookStateEvents.length > 0) {
    return t("cli.doctor.codex.companionStatus.stale", { key: COMPANION_PLUGIN_KEY, events: formatCompanionLifecycleEvents(config.companionLifecycleHookStateEvents) })
  }
  return t("common.none")
}

function readCompanionLifecycleHookStateEvents(content: string): readonly string[] {
  const events = new Set<string>()
  for (const section of splitTomlSections(content)) {
    if (section.header === null) continue
    const key = parseHookStateHeaderKey(section.header)
    const event = key === null ? null : companionLifecycleEventFromHookStateKey(key)
    if (event !== null) events.add(event)
  }
  return [...events].sort(compareCompanionLifecycleEvents)
}

function companionLifecycleEventFromHookStateKey(key: string): string | null {
  if (!key.startsWith(`${COMPANION_PLUGIN_KEY}:`)) return null
  const eventName = key.split(":").at(-3)
  return eventName !== undefined && COMPANION_LIFECYCLE_EVENTS.has(eventName) ? eventName : null
}

function compareCompanionLifecycleEvents(left: string, right: string): number {
  return companionLifecycleEventOrder(left) - companionLifecycleEventOrder(right)
}

function companionLifecycleEventOrder(event: string): number {
  return event === "session_start" ? 0 : event === "stop" ? 1 : 2
}

function formatCompanionLifecycleEvents(events: readonly string[]): string {
  return events.map(formatCompanionLifecycleEvent).join(", ")
}

function formatCompanionLifecycleEvent(event: string): string {
  switch (event) {
    case "session_start":
      return "SessionStart"
    case "stop":
      return "Stop"
    default:
      return event
  }
}

function sectionBody(content: string, sectionName: string): string {
  const start = content.indexOf(`[${sectionName}]`)
  if (start === -1) return ""
  const rest = content.slice(start)
  const next = rest.slice(1).search(/\n\[/)
  return next === -1 ? rest : rest.slice(0, next + 1)
}

function compareVersionsDescending(left: string, right: string): number {
  const leftParts = left.split(".").map(Number)
  const rightParts = right.split(".").map(Number)
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const diff = (rightParts[index] ?? 0) - (leftParts[index] ?? 0)
    if (diff !== 0) return diff
  }
  return right.localeCompare(left)
}



async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path)
    return true
  } catch (error) {
    if (error instanceof Error) return false
    throw error
  }
}
