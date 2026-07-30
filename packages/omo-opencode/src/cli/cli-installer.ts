import { createInterface } from "node:readline/promises"
import color from "picocolors"
import { PLUGIN_NAME, PUBLISHED_PACKAGE_NAME } from "../shared"
import type { InstallArgs, InstallPlatform } from "./types"
import {
  addPluginToOpenCodeConfig,
  detectCurrentConfig,
  getOpenCodeVersion,
  isOpenCodeInstalled,
  writeOmoConfig,
} from "./config-manager"
import {
  SYMBOLS,
  argsToConfig,
  detectedToInitialValues,
  formatConfigSummary,
  printBox,
  printError,
  printHeader,
  printInfo,
  printStep,
  printSuccess,
  printWarning,
  validateNonTuiArgs,
} from "./install-validators"
import { getUnsupportedOpenCodeVersionMessage } from "./minimum-opencode-version"
import { runCodexInstaller } from "./install-codex"
import { runSenpiInstaller } from "./install-senpi"
import { starGitHubRepositories } from "./star-request"
import { getNoModelProvidersWarning, hasAnyConfiguredProvider } from "./provider-availability"
import { ensureTuiPluginEntry } from "./config-manager/add-tui-plugin-to-tui-config"
import * as astGrepInstall from "./install-ast-grep-sg"
import { t } from "../shared/i18n"

export async function runCliInstaller(args: InstallArgs, version: string): Promise<number> {
  const validation = validateNonTuiArgs(args)
  if (!validation.valid) {
    printHeader(false)
    printError(t("cli.cli-installer.validationFailed"))
    for (const err of validation.errors) {
      console.log(`  ${SYMBOLS.bullet} ${err}`)
    }
    console.log()
    printInfo(
      t("cli.cli-installer.usageHint", { packageName: PUBLISHED_PACKAGE_NAME }),
    )
    console.log()
    return 1
  }

  const config = argsToConfig(args)
  const hasOpenCode = config.hasOpenCode
  const detected = hasOpenCode
    ? detectCurrentConfig()
    : {
        isInstalled: false,
        installedVersion: null,
        hasClaude: false,
        isMax20: false,
        hasOpenAI: false,
        hasGemini: false,
        hasCopilot: false,
        hasCodex: false,
        hasOpencodeZen: false,
        hasZaiCodingPlan: false,
        hasKimiForCoding: false,
        hasOpencodeGo: false,
        hasBailianCodingPlan: false,
        hasMinimaxCnCodingPlan: false,
        hasMinimaxCodingPlan: false,
        hasVercelAiGateway: false,
      }
  const isUpdate = hasOpenCode && detected.isInstalled

  printHeader(isUpdate)

  const totalSteps = hasOpenCode ? 4 : 2
  let step = 1

  if (hasOpenCode) {
    printStep(step++, totalSteps, t("cli.cli-installer.checkingOpenCode"))
    const installed = await isOpenCodeInstalled()
    const openCodeVersion = await getOpenCodeVersion()
    if (!installed) {
      printWarning(t("cli.cli-installer.opencodeNotFoundDetail"))
      printInfo(t("cli.cli-installer.installGuideBody"))
    } else {
      printSuccess(t("cli.cli-installer.opencodeDetected", { version: openCodeVersion ?? "" }))

      const unsupportedVersionMessage = getUnsupportedOpenCodeVersionMessage(openCodeVersion)
      if (unsupportedVersionMessage) {
        printWarning(unsupportedVersionMessage)
        return 1
      }
    }
  }

  if (isUpdate) {
    const initial = detectedToInitialValues(detected)
    printInfo(t("cli.cli-installer.currentConfig", { claude: initial.claude, gemini: initial.gemini }))
  }

  if (hasOpenCode) {
    printStep(step++, totalSteps, t("cli.cli-installer.addingPlugin", { pluginName: PLUGIN_NAME }))
    const pluginResult = await addPluginToOpenCodeConfig(version)
    if (!pluginResult.success) {
      printError(t("cli.cli-installer.failedAddPlugin", { error: pluginResult.error }))
      return 1
    }
    printSuccess(
      t("cli.cli-installer.pluginStatus", {
        status: isUpdate ? t("cli.cli-installer.pluginVerified") : t("cli.cli-installer.pluginAdded"),
        arrow: SYMBOLS.arrow,
        path: color.dim(pluginResult.configPath),
      }),
    )
    try {
      ensureTuiPluginEntry()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      printWarning(t("cli.cli-installer.couldNotUpdateTui", { message }))
    }

    printStep(step++, totalSteps, t("cli.cli-installer.writingConfig", { pluginName: PLUGIN_NAME }))
    const omoResult = writeOmoConfig(config)
    if (!omoResult.success) {
      printError(t("cli.cli-installer.failedWriteConfig", { error: omoResult.error }))
      return 1
    }
    printSuccess(t("cli.cli-installer.configWritten", { arrow: SYMBOLS.arrow, path: color.dim(omoResult.configPath) }))
    await astGrepInstall.installAstGrepForOpenCode({ log: printWarning })
  }

  printBox(formatConfigSummary(config), isUpdate ? t("cli.cli-installer.note.updatedConfig") : t("cli.cli-installer.note.installComplete"))

  if (config.hasOpenCode && !config.hasClaude) {
    printInfo(
      t("cli.cli-installer.note.claudeBest", { label: `${color.bold("Note:")}` }),
    )
  }

  if (config.hasOpenCode && !hasAnyConfiguredProvider(config)) {
    printWarning(getNoModelProvidersWarning())
  }

  console.log(`${SYMBOLS.star} ${color.bold(color.green(isUpdate ? t("cli.tui-installer.configUpdated") : t("cli.tui-installer.installComplete")))}`)
  if (hasOpenCode) {
    console.log(t("cli.tui-installer.runToStart", { command: `  ${color.cyan("opencode")}` }))
  }
  console.log()

  if (config.hasCodex) {
    printInfo(t("cli.cli-installer.codexInstalling"))
    try {
      const codexResult = await runCodexInstaller({ autonomousPermissions: config.codexAutonomous })
      printSuccess(t("cli.cli-installer.codexInstalled", { arrow: SYMBOLS.arrow, path: color.dim(codexResult.configPath) }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!config.hasOpenCode) {
        printError(t("cli.cli-installer.codexInstallFailed", { message }))
        return 1
      }
      printWarning(t("cli.cli-installer.codexInstallFailedOcOk", { message }))
    }
    console.log()
  }

  if (config.hasSenpi) {
    printInfo(t("cli.cli-installer.senpiInstalling"))
    try {
      const senpiResult = await runSenpiInstaller()
      printSuccess(t("cli.cli-installer.senpiInstalled", { arrow: SYMBOLS.arrow, path: color.dim(senpiResult.settingsPath) }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      printError(t("cli.cli-installer.senpiInstallFailed", { message }))
      return 1
    }
    console.log()
  }

  printInfo(t("cli.tui-installer.telemetryNote"))
  printInfo(t("cli.tui-installer.docsNote"))
  console.log()

  printBox(
    t("cli.cli-installer.magicWordBody", { label: `${color.bold("Pro Tip:")}`, word: color.cyan("ultrawork"), wordShort: color.cyan("ulw") }),
    t("cli.cli-installer.magicWordTitle"),
  )

  if (args.tui) {
    await maybePromptForGitHubStars(config.platform)
  }
  console.log(color.dim(t("cli.tui-installer.enjoy")))
  console.log()

  if (hasOpenCode && (config.hasClaude || config.hasGemini || config.hasCopilot) && !args.skipAuth) {
    printBox(
      t("cli.cli-installer.authBody", { command: color.cyan("opencode auth login") }) + "\n" +
        (config.hasClaude ? `  ${SYMBOLS.bullet} ${t("cli.cli-installer.authProviderAnthropicHint")} ${color.gray(`→ ${t("cli.cli-installer.authProviderAnthropicDetail")}`)}\n` : "") +
        (config.hasGemini ? `  ${SYMBOLS.bullet} ${t("cli.cli-installer.authProviderGoogleHint")} ${color.gray(`→ ${t("cli.cli-installer.authProviderGoogleDetail")}`)}\n` : "") +
        (config.hasCopilot ? `  ${SYMBOLS.bullet} ${t("cli.cli-installer.authProviderGithubHint")} ${color.gray(`→ ${t("cli.cli-installer.authProviderGithubDetail")}`)}` : ""),
      t("cli.cli-installer.authTitle"),
    )
  }

  return 0
}

async function maybePromptForGitHubStars(platform: InstallPlatform): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return

  const readline = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await readline.question(`${SYMBOLS.star} ${color.yellow(t("cli.cli-installer.starQuestion"))} ${color.dim(t("cli.cli-installer.starQuestionHint"))} `)
    if (!isYes(answer)) return
  } finally {
    readline.close()
  }

  const results = await starGitHubRepositories(platform)
  const failed = results.filter((result) => !result.ok)
  if (failed.length === 0) {
    printSuccess(t("cli.cli-installer.starred"))
    console.log()
    return
  }

  printWarning(t("cli.cli-installer.couldNotStar"))
  for (const result of failed) {
    console.log(`  ${SYMBOLS.bullet} ${result.repository}`)
  }
  console.log()
}

function isYes(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return normalized === "y" || normalized === "yes"
}
