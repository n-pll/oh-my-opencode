import * as p from "@clack/prompts"
import type { Option } from "@clack/prompts"
import type {
  ClaudeSubscription,
  DetectedConfig,
  InstallConfig,
  InstallPlatform,
} from "./types"
import { detectedToInitialValues } from "./install-validators"
import { ULTIMATE_FALLBACK } from "./model-fallback"
import { isSenpiPlatformEnabled } from "./senpi-platform-flag"
import { t } from "../shared/i18n"

async function selectOrCancel<TValue extends Readonly<string | boolean | number>>(params: {
  message: string
  options: Option<TValue>[]
  initialValue: TValue
}): Promise<TValue | null> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return null

  const value = await p.select<TValue>({
    message: params.message,
    options: params.options,
    initialValue: params.initialValue,
  })
  if (p.isCancel(value)) {
    p.cancel(t("cli.install.cancelled"))
    return null
  }
  return value as TValue
}

function otherProvidersHint(): string {
  return t("cli.install.hint.otherProviders")
}

function yesNoOptions(yesHint: string): Option<string>[] {
  return [
    { value: "no", label: t("cli.install.option.no"), hint: otherProvidersHint() },
    { value: "yes", label: t("cli.install.option.yes"), hint: yesHint },
  ]
}

export async function promptInstallPlatform(
  initialValue: InstallPlatform = "opencode",
): Promise<InstallPlatform | null> {
  const options: Option<InstallPlatform>[] = [
    { value: "opencode", label: t("cli.install.platform.opencode.label"), hint: t("cli.install.platform.opencode.hint") },
    { value: "codex", label: t("cli.install.platform.codex.label"), hint: t("cli.install.platform.codex.hint") },
    { value: "both", label: t("cli.install.platform.both.label"), hint: t("cli.install.platform.both.hint") },
  ]
  if (isSenpiPlatformEnabled()) {
    options.push({ value: "senpi", label: "Senpi", hint: "Install Senpi harness adapter only" })
  }

  return selectOrCancel<InstallPlatform>({
    message: t("cli.install.platform.question"),
    options,
    initialValue,
  })
}

export async function promptInstallConfig(
  detected: DetectedConfig,
  platform: InstallPlatform,
  codexAutonomousOverride?: boolean,
): Promise<InstallConfig | null> {
  const hasOpenCode = platform === "opencode" || platform === "both"
  const hasCodex = platform === "codex" || platform === "both"
  const hasSenpi = platform === "senpi"
  const codexAutonomous = await resolveCodexAutonomous(hasCodex, codexAutonomousOverride)
  if (codexAutonomous === null) return null

  if (!hasOpenCode) {
    return {
      platform,
      hasOpenCode: false,
      hasClaude: false,
      isMax20: false,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasCodex,
      hasSenpi,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasMinimaxCnCodingPlan: false,
      hasMinimaxCodingPlan: false,
      hasVercelAiGateway: false,
      codexAutonomous,
    }
  }

  const initial = detectedToInitialValues(detected)

  const claude = await selectOrCancel<ClaudeSubscription>({
    message: t("cli.install.claude.question"),
    options: [
      { value: "no", label: t("cli.install.option.no"), hint: t("cli.install.claude.hint.no", { fallback: ULTIMATE_FALLBACK }) },
      { value: "yes", label: t("cli.install.claude.option.yesStandard"), hint: t("cli.install.claude.option.yesStandard.hint") },
      { value: "max20", label: t("cli.install.claude.option.max20"), hint: t("cli.install.claude.option.max20.hint") },
    ],
    initialValue: initial.claude,
  })
  if (!claude) return null

  const openai = await selectOrCancel({
    message: t("cli.install.openai.question"),
    options: [
      { value: "no", label: t("cli.install.option.no"), hint: t("cli.install.openai.hint.no") },
      { value: "yes", label: t("cli.install.option.yes"), hint: t("cli.install.openai.hint.yes") },
    ],
    initialValue: initial.openai,
  })
  if (!openai) return null

  const gemini = await selectOrCancel({
    message: t("cli.install.gemini.question"),
    options: [
      { value: "no", label: t("cli.install.option.no"), hint: t("cli.install.gemini.hint.no") },
      { value: "yes", label: t("cli.install.option.yes"), hint: t("cli.install.gemini.hint.yes") },
    ],
    initialValue: initial.gemini,
  })
  if (!gemini) return null

  const copilot = await selectOrCancel({
    message: t("cli.install.copilot.question"),
    options: [
      { value: "no", label: t("cli.install.option.no"), hint: t("cli.install.copilot.hint.no") },
      { value: "yes", label: t("cli.install.option.yes"), hint: t("cli.install.copilot.hint.yes") },
    ],
    initialValue: initial.copilot,
  })
  if (!copilot) return null

  const opencodeZen = await selectOrCancel({
    message: t("cli.install.opencodeZen.question"),
    options: yesNoOptions(t("cli.install.opencodeZen.hint.yes")),
    initialValue: initial.opencodeZen,
  })
  if (!opencodeZen) return null

  const zaiCodingPlan = await selectOrCancel({
    message: t("cli.install.zaiCodingPlan.question"),
    options: yesNoOptions(t("cli.install.zaiCodingPlan.hint.yes")),
    initialValue: initial.zaiCodingPlan,
  })
  if (!zaiCodingPlan) return null

  const kimiForCoding = await selectOrCancel({
    message: t("cli.install.kimiForCoding.question"),
    options: yesNoOptions(t("cli.install.kimiForCoding.hint.yes")),
    initialValue: initial.kimiForCoding,
  })
  if (!kimiForCoding) return null

  const opencodeGo = await selectOrCancel({
    message: t("cli.install.opencodeGo.question"),
    options: yesNoOptions(t("cli.install.opencodeGo.hint.yes")),
    initialValue: initial.opencodeGo,
  })
  if (!opencodeGo) return null

  const bailianCodingPlan = await selectOrCancel({
    message: t("cli.install.bailianCodingPlan.question"),
    options: yesNoOptions(t("cli.install.bailianCodingPlan.hint.yes")),
    initialValue: initial.bailianCodingPlan,
  })
  if (!bailianCodingPlan) return null

  const minimaxCnCodingPlan = await selectOrCancel({
    message: t("cli.install.minimaxCnCodingPlan.question"),
    options: yesNoOptions(t("cli.install.minimaxCnCodingPlan.hint.yes")),
    initialValue: initial.minimaxCnCodingPlan,
  })
  if (!minimaxCnCodingPlan) return null

  const minimaxCodingPlan = await selectOrCancel({
    message: t("cli.install.minimaxCodingPlan.question"),
    options: yesNoOptions(t("cli.install.minimaxCodingPlan.hint.yes")),
    initialValue: initial.minimaxCodingPlan,
  })
  if (!minimaxCodingPlan) return null

  const vercelAiGateway = await selectOrCancel({
    message: t("cli.install.vercelAiGateway.question"),
    options: yesNoOptions(t("cli.install.vercelAiGateway.hint.yes")),
    initialValue: initial.vercelAiGateway,
  })
  if (!vercelAiGateway) return null

  return {
    platform,
    hasOpenCode: true,
    hasClaude: claude !== "no",
    isMax20: claude === "max20",
    hasOpenAI: openai === "yes",
    hasGemini: gemini === "yes",
    hasCopilot: copilot === "yes",
    hasCodex,
    hasSenpi,
    hasOpencodeZen: opencodeZen === "yes",
    hasZaiCodingPlan: zaiCodingPlan === "yes",
    hasKimiForCoding: kimiForCoding === "yes",
    hasOpencodeGo: opencodeGo === "yes",
    hasBailianCodingPlan: bailianCodingPlan === "yes",
    hasMinimaxCnCodingPlan: minimaxCnCodingPlan === "yes",
    hasMinimaxCodingPlan: minimaxCodingPlan === "yes",
    hasVercelAiGateway: vercelAiGateway === "yes",
    codexAutonomous,
  }
}

async function resolveCodexAutonomous(
  hasCodex: boolean,
  override: boolean | undefined,
): Promise<boolean | null> {
  if (!hasCodex) return false
  if (override !== undefined) return override
  return true
}
