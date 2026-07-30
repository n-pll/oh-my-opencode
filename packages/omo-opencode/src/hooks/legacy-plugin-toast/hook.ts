import type { PluginInput } from "@opencode-ai/plugin"

import { checkForLegacyPluginEntry } from "../../shared/legacy-plugin-warning"
import { log } from "../../shared/logger"
import { t } from "../../shared/i18n"
import { LEGACY_PLUGIN_NAME, PLUGIN_NAME, PUBLISHED_PACKAGE_NAME } from "../../shared/plugin-identity"
import { autoMigrateLegacyPluginEntry } from "./auto-migrate-runner"

type LegacyPluginToastDeps = {
  checkForLegacyPluginEntry?: typeof checkForLegacyPluginEntry
  log?: typeof log
  autoMigrateLegacyPluginEntry?: typeof autoMigrateLegacyPluginEntry
}

export function createLegacyPluginToastHook(ctx: PluginInput, deps: LegacyPluginToastDeps = {}) {
  let fired = false
  const checkForLegacyPluginEntryFn = deps.checkForLegacyPluginEntry ?? checkForLegacyPluginEntry
  const logFn = deps.log ?? log
  const autoMigrateLegacyPluginEntryFn = deps.autoMigrateLegacyPluginEntry ?? autoMigrateLegacyPluginEntry

  return {
    event: async ({ event }: { event: { type: string; properties?: unknown } }) => {
      if (event.type !== "session.created" || fired) return

      const props = event.properties as { info?: { parentID?: string } } | undefined
      if (props?.info?.parentID) return

      fired = true

      const result = checkForLegacyPluginEntryFn()
      if (!result.hasLegacyEntry) return

      const migration = autoMigrateLegacyPluginEntryFn()

      if (migration.migrated) {
        logFn("[legacy-plugin-toast] Auto-migrated opencode.json plugin entry", {
          from: migration.from,
          to: migration.to,
        })

        await ctx.client.tui
          .showToast({
            body: {
              title: t("hooks.legacyPluginToast.migratedTitle"),
              message: t("hooks.legacyPluginToast.migratedMessage", {
                from: migration.from,
                to: migration.to,
              }),
              variant: "success" as const,
              duration: 8000,
            },
          })
          .catch(() => {})
      } else {
        logFn("[legacy-plugin-toast] Legacy entry detected but migration failed", {
          legacyEntries: result.legacyEntries,
        })

        await ctx.client.tui
          .showToast({
            body: {
              title: t("hooks.legacyPluginToast.legacyDetectedTitle"),
               message: t("hooks.legacyPluginToast.legacyDetectedMessage", {
                legacyName: LEGACY_PLUGIN_NAME,
                newName: PLUGIN_NAME,
                packageName: PUBLISHED_PACKAGE_NAME,
              }),
              variant: "warning" as const,
              duration: 10000,
            },
          })
          .catch(() => {})
      }
    },
  }
}
