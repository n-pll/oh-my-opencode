import color from "picocolors"
import { PLUGIN_NAME, PUBLISHED_PACKAGE_NAME } from "../../shared"
import type { VersionInfo } from "./types"
import { t } from "../../shared/i18n"

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
  lines.push(color.bold(color.white(t("cli.version.header", { pluginName: PLUGIN_NAME }))))
  lines.push(color.dim("─".repeat(50)))
  lines.push("")

  if (info.currentVersion) {
    lines.push(`  ${t("cli.version.currentVersion", { version: color.cyan(info.currentVersion) })}`)
  } else {
    lines.push(`  ${color.dim(t("cli.version.currentVersionUnknown"))}`)
  }

  if (!info.isLocalDev && info.latestVersion) {
    lines.push(`  ${t("cli.version.latestVersion", { version: color.cyan(info.latestVersion) })}`)
  }

  lines.push("")

  switch (info.status) {
    case "up-to-date":
      lines.push(`  ${SYMBOLS.check} ${color.green(t("cli.version.upToDate"))}`)
      break
    case "outdated":
      lines.push(`  ${SYMBOLS.warn} ${color.yellow(t("cli.version.updateAvailable"))}`)
      lines.push(`  ${color.dim("Run:")} ${color.cyan(t("cli.version.runUpdate"))}`)
      break
    case "local-dev":
      lines.push(`  ${SYMBOLS.dev} ${color.cyan(t("cli.version.localDev"))}`)
      lines.push(`  ${color.dim(t("cli.version.usingFileProtocol"))}`)
      break
    case "dev":
      lines.push(`  ${SYMBOLS.dev} ${color.cyan("Running a local dev build")}`)
      lines.push(`  ${color.dim("Installed from source; update checks are skipped")}`)
      break
    case "pinned":
      lines.push(`  ${SYMBOLS.pin} ${color.magenta(t("cli.version.versionPinned", { version: info.pinnedVersion }))}`)
      lines.push(`  ${color.dim(t("cli.version.updateCheckSkipped"))}`)
      break
    case "pinned-mismatch":
      lines.push(`  ${SYMBOLS.warn} ${color.yellow(`Version pinned to ${info.pinnedVersion} but running ${info.currentVersion}`)}`)
      lines.push(`  ${color.dim("The pin only skips the update check; it does not control which version OpenCode loads")}`)
      break
    case "error":
      lines.push(`  ${SYMBOLS.cross} ${color.red(t("cli.version.unableToCheckUpdates"))}`)
      lines.push(`  ${color.dim(t("cli.version.networkError"))}`)
      break
    case "unknown":
      lines.push(`  ${SYMBOLS.info} ${color.yellow(t("cli.version.versionInfoUnavailable"))}`)
      break
  }

  lines.push("")

  return lines.join("\n")
}

export function formatJsonOutput(info: VersionInfo): string {
  return JSON.stringify(info, null, 2)
}
