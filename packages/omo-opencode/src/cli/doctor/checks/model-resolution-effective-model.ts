import type { ModelRequirement } from "../../../shared/model-requirements"
import { t } from "../../../shared/i18n"

function formatProviderChain(providers: string[]): string {
  return providers.join(" → ")
}

export function getEffectiveModel(requirement: ModelRequirement, userOverride?: string): string {
  if (userOverride) {
    return userOverride
  }
  const firstEntry = requirement.fallbackChain[0]
  if (!firstEntry) {
    return t("cli.doctor.models.effective.unknown")
  }
  return `${firstEntry.providers[0]}/${firstEntry.model}`
}

export function buildEffectiveResolution(requirement: ModelRequirement, userOverride?: string): string {
  if (userOverride) {
    return t("cli.doctor.models.effective.userOverride", { model: userOverride })
  }
  const firstEntry = requirement.fallbackChain[0]
  if (!firstEntry) {
    return t("cli.doctor.models.effective.noFallbackChain")
  }
  return t("cli.doctor.models.effective.providerFallback", { chain: formatProviderChain(firstEntry.providers), model: firstEntry.model })
}
