import type { PluginInput } from "@opencode-ai/plugin"
import { isModelCacheAvailable } from "../../../shared/model-availability"
import { t } from "../../../shared/i18n"
import { log } from "../../../shared/logger"
import { ignoreToastError } from "./ignore-toast-error"

export async function showModelCacheWarningIfNeeded(ctx: PluginInput): Promise<void> {
  if (isModelCacheAvailable()) return

  await ctx.client.tui
    .showToast({
      body: {
        title: t("hooks.autoUpdateChecker.modelCacheMissing.title"),
        message: t("hooks.autoUpdateChecker.modelCacheMissing.message"),
        variant: "warning" as const,
        duration: 10000,
      },
    })
    .catch(ignoreToastError)

  log("[auto-update-checker] Model cache warning shown")
}
