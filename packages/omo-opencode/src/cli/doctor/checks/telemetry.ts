import { existsSync, readFileSync } from "node:fs"
import {
  getTelemetryActivityStateFilePath,
  getTelemetryHost,
  resolveTelemetryStateDir,
} from "@oh-my-opencode/telemetry-core"
import { validatePluginConfig } from "../../../config/validate"
import { createOpencodeTelemetryProductConfig } from "../../../shared/telemetry-product-identity"
import { shouldDisablePostHog } from "../../../shared/posthog"
import { CHECK_IDS, CHECK_NAMES } from "../framework/constants"
import type { CheckResult } from "../framework/types"
import { t } from "../../../shared/i18n"

type TelemetryState = {
  readonly lastActiveDayUTC?: string
}

function isTelemetryState(value: unknown): value is TelemetryState {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function readLastActiveDay(stateFilePath: string): string {
  if (!existsSync(stateFilePath)) {
    return t("cli.doctor.telemetry.never")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(stateFilePath, "utf-8"))
  } catch (error) {
    if (error instanceof Error) {
      return t("cli.doctor.telemetry.unreadable")
    }
    throw error
  }
  if (!isTelemetryState(parsed)) {
    return t("cli.doctor.telemetry.unreadable")
  }

  return parsed.lastActiveDayUTC ?? t("cli.doctor.telemetry.never")
}

function describeTelemetryStatus(configEnabled: boolean | undefined): string {
  return shouldDisablePostHog(process.env, configEnabled) ? t("cli.doctor.telemetry.status.disabled") : t("cli.doctor.telemetry.status.enabled")
}

export async function checkTelemetry(): Promise<CheckResult> {
  const product = createOpencodeTelemetryProductConfig()
  const validation = validatePluginConfig(process.cwd())
  const status = describeTelemetryStatus(validation.config.telemetry)
  const stateFilePath = getTelemetryActivityStateFilePath(resolveTelemetryStateDir(product))
  const lastActiveDay = readLastActiveDay(stateFilePath)

  return {
    name: CHECK_NAMES[CHECK_IDS.TELEMETRY],
    status: "pass",
    message: t("cli.doctor.telemetry.message", { status }),
    details: [
      t("cli.doctor.telemetry.detail.posthogHost", { host: getTelemetryHost(process.env, product.defaultHost) }),
      t("cli.doctor.telemetry.detail.lastActive", { date: lastActiveDay }),
      t("cli.doctor.telemetry.detail.stateFile", { path: stateFilePath }),
    ],
    issues: [],
  }
}
