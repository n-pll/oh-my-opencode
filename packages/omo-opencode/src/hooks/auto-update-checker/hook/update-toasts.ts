import type { PluginInput } from "@opencode-ai/plugin"
import { t } from "../../../shared/i18n"
import { log } from "../../../shared/logger"
import { ignoreToastError } from "./ignore-toast-error"

export async function showUpdateAvailableToast(
  ctx: PluginInput,
  latestVersion: string,
  getToastMessage: (isUpdate: boolean, latestVersion?: string) => string
): Promise<void> {
  await ctx.client.tui
    .showToast({
      body: {
        title: t("hooks.autoUpdateChecker.updateAvailable.title", { latestVersion }),
        message: getToastMessage(true, latestVersion),
        variant: "info" as const,
        duration: 8000,
      },
    })
    .catch(ignoreToastError)
  log(`[auto-update-checker] Update available toast shown: v${latestVersion}`)
}

export async function showAutoUpdatedToast(ctx: PluginInput, oldVersion: string, newVersion: string): Promise<void> {
  await ctx.client.tui
    .showToast({
      body: {
        title: t("hooks.autoUpdateChecker.autoUpdated.title"),
        message: t("hooks.autoUpdateChecker.autoUpdated.message", { oldVersion, newVersion }),
        variant: "success" as const,
        duration: 8000,
      },
    })
    .catch(ignoreToastError)
  log(`[auto-update-checker] Auto-updated toast shown: v${oldVersion} → v${newVersion}`)
}
