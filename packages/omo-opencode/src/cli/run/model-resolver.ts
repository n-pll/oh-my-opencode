import { t } from "../../shared/i18n"

export function resolveRunModel(
  modelString?: string
): { providerID: string; modelID: string } | undefined {
  if (modelString === undefined) {
    return undefined
  }

  const trimmed = modelString.trim()
  if (trimmed.length === 0) {
    throw new Error(t("cli.run.model.empty"))
  }

  const parts = trimmed.split("/")
  if (parts.length < 2) {
    throw new Error(t("cli.run.model.invalidFormat"))
  }

  const providerID = parts[0]
  if (providerID.length === 0) {
    throw new Error(t("cli.run.model.providerEmpty"))
  }

  const modelID = parts.slice(1).join("/")
  if (modelID.length === 0) {
    throw new Error(t("cli.run.model.modelIdEmpty"))
  }

  return { providerID, modelID }
}
