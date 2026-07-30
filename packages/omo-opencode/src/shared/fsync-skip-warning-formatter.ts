import { describePathClassification } from "./classify-path-environment"
import type { FsyncSkipEntry } from "./fsync-skip-tracker"
import { t } from "./i18n"

const MAX_PATH_LINES = 5

function selectMostCommonClassification(
  entries: FsyncSkipEntry[],
): FsyncSkipEntry["pathClassification"] {
  const counts = new Map<FsyncSkipEntry["pathClassification"], number>()

  for (const entry of entries) {
    const currentCount = counts.get(entry.pathClassification) ?? 0
    counts.set(entry.pathClassification, currentCount + 1)
  }

  let selected: FsyncSkipEntry["pathClassification"] = "unknown"
  let selectedCount = -1
  for (const [classification, count] of counts.entries()) {
    if (count > selectedCount) {
      selected = classification
      selectedCount = count
    }
  }

  return selected
}

export function formatFsyncSkipWarning(entries: FsyncSkipEntry[]): string {
  if (entries.length === 0) return ""

  const selectedClassification = selectMostCommonClassification(entries)
  const selectedDescription = describePathClassification(selectedClassification)
  const shownEntries = entries.slice(0, MAX_PATH_LINES)
  const hiddenCount = Math.max(entries.length - shownEntries.length, 0)
  const pathLines = shownEntries.map((entry) => t("shared.fsyncSkip.pathLine", { path: entry.filePath, code: entry.errorCode }))
  if (hiddenCount > 0) {
    pathLines.push(t("shared.fsyncSkip.morePaths", { count: hiddenCount }))
  }

  const environmentLines = selectedClassification === "unknown"
    ? []
    : [t("shared.fsyncSkip.detectedEnvironment", { description: selectedDescription })]

  const durabilityLine = selectedClassification === "unknown"
    ? t("shared.fsyncSkip.meaning.durabilityUnknown")
    : t("shared.fsyncSkip.meaning.durabilityKnown")

  return [
    "---",
    t("shared.fsyncSkip.header", { count: entries.length }),
    "",
    ...environmentLines,
    t("shared.fsyncSkip.affectedPaths"),
    ...pathLines,
    "",
    t("shared.fsyncSkip.whatThisMeans"),
    t("shared.fsyncSkip.meaning.success"),
    durabilityLine,
    t("shared.fsyncSkip.noActionRequired"),
  ].join("\n")
}
