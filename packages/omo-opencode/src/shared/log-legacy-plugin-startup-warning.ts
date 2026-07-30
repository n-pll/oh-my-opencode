import { checkForLegacyPluginEntry } from "./legacy-plugin-warning"
import { log } from "./logger"
import { migrateLegacyPluginEntry } from "./migrate-legacy-plugin-entry"
import { toCanonicalEntry } from "./plugin-entry-migrator"
import { LEGACY_PLUGIN_NAME, PLUGIN_NAME } from "./plugin-identity"
import { t } from "./i18n"

type LogLegacyPluginStartupWarningDeps = {
  checkForLegacyPluginEntry?: typeof checkForLegacyPluginEntry
  log?: typeof log
  migrateLegacyPluginEntry?: typeof migrateLegacyPluginEntry
}

export function logLegacyPluginStartupWarning(deps: LogLegacyPluginStartupWarningDeps = {}): void {
  const checkForLegacyPluginEntryFn = deps.checkForLegacyPluginEntry ?? checkForLegacyPluginEntry
  const logFn = deps.log ?? log
  const migrateLegacyPluginEntryFn = deps.migrateLegacyPluginEntry ?? migrateLegacyPluginEntry

  const result = checkForLegacyPluginEntryFn()
  if (!result.hasLegacyEntry || !result.configPath) {
    return
  }

  const suggestedEntries = result.legacyEntries.map(toCanonicalEntry)

  logFn(t("shared.legacyPluginMigration.logMessage"), {
    legacyEntries: result.legacyEntries,
    suggestedEntries,
    hasCanonicalEntry: result.hasCanonicalEntry,
  })

  console.warn(
    t("shared.legacyPluginMigration.warning", { legacyName: LEGACY_PLUGIN_NAME, pluginName: PLUGIN_NAME }),
  )

  const migrated = migrateLegacyPluginEntryFn(result.configPath)
  if (migrated) {
    console.warn(t("shared.legacyPluginMigration.autoMigrated", { legacyEntries: result.legacyEntries.join(", "), suggestedEntries: suggestedEntries.join(", ") }))
  } else {
    const mapping = result.legacyEntries
      .map((e, i) => t("shared.legacyPluginMigration.entryMapping", { legacy: e, suggested: suggestedEntries[i] }))
      .join(", ")
    console.warn(t("shared.legacyPluginMigration.couldNotAutoMigrate", { mapping }))
  }
}
