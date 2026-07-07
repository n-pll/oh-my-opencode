import { join } from "node:path"

import { getOpenCodeCacheDir } from "../../../shared"
import type { AvailableModelsInfo, ModelResolutionInfo, OmoConfig } from "./model-resolution-types"
import { formatModelWithVariant, getCategoryEffectiveVariant, getEffectiveVariant } from "./model-resolution-variant"
import { t } from "../../../shared/i18n"

function formatCapabilityResolutionLabel(mode: string | undefined): string {
  return mode ?? t("common.unknown")
}

export function buildModelResolutionDetails(options: {
  info: ModelResolutionInfo
  available: AvailableModelsInfo
  config: OmoConfig
}): string[] {
  const details: string[] = []
  const cacheFile = join(getOpenCodeCacheDir(), "models.json")

  details.push(t("cli.doctor.models.detail.availableHeader"))
  details.push("")
  if (options.available.cacheExists) {
    details.push(t("cli.doctor.models.detail.providersInCache", { count: options.available.providers.length }))
    details.push(
      t("cli.doctor.models.detail.sample", { sample: options.available.providers.slice(0, 6).join(", "), ellipsis: options.available.providers.length > 6 ? "..." : "" })
    )
    details.push(t("cli.doctor.models.detail.totalModels", { count: options.available.modelCount }))
    details.push(t("cli.doctor.models.detail.cache", { path: cacheFile }))
    details.push(t("cli.doctor.models.detail.runtimeNote"))
    details.push(t("cli.doctor.models.detail.refresh"))
  } else {
    details.push(t("cli.doctor.models.detail.cacheNotFoundDetail"))
  }
  details.push("")

  details.push(t("cli.doctor.models.detail.configuredHeader"))
  details.push("")
  details.push(t("cli.doctor.models.detail.agentsHeader"))
  for (const agent of options.info.agents) {
    const marker = agent.userOverride ? "●" : "○"
    const display = formatModelWithVariant(
      agent.effectiveModel,
      getEffectiveVariant(agent.name, agent.requirement, options.config)
    )
    details.push(t("cli.doctor.models.detail.entry", { marker, name: agent.name, display, mode: formatCapabilityResolutionLabel(agent.capabilityDiagnostics?.resolutionMode) }))
  }
  details.push("")
  details.push(t("cli.doctor.models.detail.categoriesHeader"))
  for (const category of options.info.categories) {
    const marker = category.userOverride ? "●" : "○"
    const display = formatModelWithVariant(
      category.effectiveModel,
      getCategoryEffectiveVariant(category.name, category.requirement, options.config)
    )
    details.push(t("cli.doctor.models.detail.entry", { marker, name: category.name, display, mode: formatCapabilityResolutionLabel(category.capabilityDiagnostics?.resolutionMode) }))
  }
  details.push("")
  details.push(t("cli.doctor.models.detail.legend"))

  return details
}
