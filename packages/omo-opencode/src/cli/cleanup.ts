import { cleanupCodexLight } from "./install-codex/codex-cleanup"
import { t } from "../shared/i18n"

export type CleanupPlatform = "codex"

export interface CleanupOptions {
  readonly platform?: CleanupPlatform | "opencode" | "both"
  readonly codexHome?: string
  readonly project?: string
  readonly json?: boolean
}

export function resolveCleanupPlatform(
  options: { readonly platform?: CleanupOptions["platform"] },
  invocationName: string | undefined = process.env.OMO_INVOCATION_NAME,
): CleanupOptions["platform"] | undefined {
  if (options.platform !== undefined) return options.platform
  return invocationName === "lazycodex" || invocationName === "lazycodex-ai" ? "codex" : undefined
}

export async function cleanup(options: CleanupOptions): Promise<number> {
  if (options.platform !== "codex") {
    console.error(t("cli.cleanup.onlyCodex"))
    return 1
  }

  const result = await cleanupCodexLight({
    codexHome: options.codexHome,
    projectDirectory: options.project,
  })

  if (options.json === true) {
    console.log(JSON.stringify(result, null, 2))
    return 0
  }

  console.log(t("cli.cleanup.complete", { codexHome: result.codexHome }))
  if (result.configChanged) {
    console.log(t("cli.cleanup.updatedConfig", { configPath: result.configPath }))
    if (result.configBackupPath !== undefined) console.log(t("cli.cleanup.backup", { configBackupPath: result.configBackupPath }))
  } else {
    console.log(t("cli.cleanup.noManagedBlocks", { configPath: result.configPath }))
  }
  for (const path of result.removedPaths) {
    console.log(t("cli.cleanup.removed", { path }))
  }
  for (const skippedPath of result.skippedPaths) {
    console.log(t("cli.cleanup.skipped", { path: skippedPath.path, reason: skippedPath.reason }))
  }
  for (const path of result.removedAgentLinks) {
    console.log(t("cli.cleanup.removedAgentLink", { path }))
  }
  for (const path of result.skippedAgentLinks) {
    console.log(t("cli.cleanup.skippedAgentLink", { path }))
  }
  if (result.projectCleanup.changed) {
    console.log(t("cli.cleanup.repairedProjectConfig", { configPath: result.projectCleanup.configPath }))
  }
  for (const artifact of result.projectCleanup.artifacts) {
    console.log(t("cli.cleanup.leftArtifact", { path: artifact.path }))
  }

  return 0
}
