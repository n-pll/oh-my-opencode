import { MIN_OPENCODE_VERSION } from "./doctor/framework/constants"
import { compareVersions } from "../shared/opencode-version"
import { t } from "../shared/i18n"

export function getUnsupportedOpenCodeVersionMessage(openCodeVersion: string | null): string | null {
  if (!openCodeVersion) {
    return null
  }

  if (compareVersions(openCodeVersion, MIN_OPENCODE_VERSION) >= 0) {
    return null
  }

  return t("cli.minimumOpenCodeVersion.unsupported", { detected: openCodeVersion, required: MIN_OPENCODE_VERSION })
}
