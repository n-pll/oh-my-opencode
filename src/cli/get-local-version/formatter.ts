import color from "picocolors"
import { t } from "../../i18n"
import type { VersionInfo } from "./types"

const SYMBOLS = {
  check: color.green("[OK]"),
  cross: color.red("[X]"),
  arrow: color.cyan("->"),
  info: color.blue("[i]"),
  warn: color.yellow("[!]"),
  pin: color.magenta("[PINNED]"),
  dev: color.cyan("[DEV]"),
}

export function formatVersionOutput(info: VersionInfo): string {
  const lines: string[] = []

  lines.push("")
  const versionTitle = t("cli.version.info", { version: info.currentVersion || "unknown" })
  lines.push(color.bold(color.white(versionTitle)))
  lines.push(color.dim("─".repeat(50)))
  lines.push("")

  if (info.currentVersion) {
    lines.push(`  ${t("getLocalVersion.helpCurrentVersion")}: ${color.cyan(info.currentVersion)}`)
  } else {
    lines.push(`  ${t("getLocalVersion.helpCurrentVersion")}: ${color.dim("unknown")}`)
  }

  if (!info.isLocalDev && info.latestVersion) {
    lines.push(`  ${t("getLocalVersion.helpLatestVersion")}: ${color.cyan(info.latestVersion)}`)
  }

  if (!info.isLocalDev && info.latestVersion) {
    lines.push(`  Latest Version:  ${color.cyan(info.latestVersion)}`)
  }

  lines.push("")

  switch (info.status) {
    case "up-to-date":
      lines.push(`  ${SYMBOLS.check} ${color.green(t("getLocalVersion.helpUpToDate"))}`)
      break
    case "outdated":
      lines.push(`  ${SYMBOLS.warn} ${color.yellow("Update available")}`)
      lines.push(`  ${color.dim("Run:")} ${color.cyan("cd ~/.config/opencode && bun update oh-my-opencode")}`)
      break
    case "local-dev":
      lines.push(`  ${SYMBOLS.dev} ${color.cyan("Running in local development mode")}`)
      lines.push(`  ${color.dim("Using file:// protocol from config")}`)
      break
    case "pinned":
      lines.push(`  ${SYMBOLS.pin} ${color.magenta(`Version pinned to ${info.pinnedVersion}`)}`)
      lines.push(`  ${color.dim("Update check skipped for pinned versions")}`)
      break
    case "error":
      lines.push(`  ${SYMBOLS.cross} ${color.red("Unable to check for updates")}`)
      lines.push(`  ${color.dim("Network error or npm registry unavailable")}`)
      break
    case "unknown":
      lines.push(`  ${SYMBOLS.info} ${color.yellow("Version information unavailable")}`)
      break
  }

  lines.push("")

  return lines.join("\n")
}

export function formatJsonOutput(info: VersionInfo): string {
  return JSON.stringify(info, null, 2)
}
