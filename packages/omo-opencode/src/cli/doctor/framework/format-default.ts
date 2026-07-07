import color from "picocolors"
import { PLUGIN_NAME } from "../../../shared"
import type { DoctorResult } from "./types"
import { SYMBOLS } from "./constants"
import { formatHeader, formatIssue } from "./format-shared"
import { t } from "../../../shared/i18n"

export function formatDefault(result: DoctorResult): string {
  const lines: string[] = []

  lines.push(formatHeader())

  const allIssues = result.results.flatMap((r) => r.issues)

  if (allIssues.length === 0) {
    if (result.target === "codex" && result.codex) {
      const codex = result.codex.codexPath ?? result.codex.codexAppId ?? "unknown"
      const pluginVer = result.codex.pluginVersion ?? "unknown"
      const packageName = result.codex.packageName ?? "lazycodex-ai"
      const packageVer = result.codex.packageVersion ?? result.codex.installerVersion
      lines.push(` ${color.green(SYMBOLS.check)} ${color.green(t("cli.doctor.format.lazycodexOk", { codex, pluginVer, packageName, packageVer }))}`)
      return lines.join("\n")
    }
    const opencodeVer = result.systemInfo.opencodeVersion ?? "unknown"
    const pluginVer = result.systemInfo.pluginVersion ?? "unknown"
    lines.push(
      ` ${color.green(SYMBOLS.check)} ${color.green(
      t("cli.doctor.format.systemOk", { opencodeVer, pluginName: PLUGIN_NAME, pluginVer })
      )}`
    )
  } else {
    const issueCount = allIssues.filter((i) => i.severity === "error").length
    const warnCount = allIssues.filter((i) => i.severity === "warning").length

    const total = issueCount + warnCount
    const noun = total === 1 ? t("cli.doctor.format.issueNounSingular") : t("cli.doctor.format.issueNounPlural")
    lines.push(` ${color.yellow(SYMBOLS.warn)} ${t("cli.doctor.format.issuesFound", { total, noun })}\n`)

    allIssues.forEach((issue, index) => {
      lines.push(formatIssue(issue, index + 1))
      lines.push("")
    })
  }

  return lines.join("\n")
}
