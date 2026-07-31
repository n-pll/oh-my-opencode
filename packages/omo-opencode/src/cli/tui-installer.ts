import * as p from "@clack/prompts"
import color from "picocolors"
import { PLUGIN_NAME } from "../shared"
import type { InstallArgs } from "./types"
import {
  addPluginToOpenCodeConfig,
  detectCurrentConfig,
  getOpenCodeVersion,
  isOpenCodeInstalled,
  writeOmoConfig,
} from "./config-manager"
import { detectedToInitialValues, formatConfigSummary, SYMBOLS } from "./install-validators"
import { getUnsupportedOpenCodeVersionMessage } from "./minimum-opencode-version"
import { promptInstallConfig, promptInstallPlatform } from "./tui-install-prompts"
import { detectCodexInstallation, formatCodexInstallationWarning, runCodexInstaller } from "./install-codex"
import { runSenpiInstaller } from "./install-senpi"
import { starGitHubRepositories } from "./star-request"
import { getNoModelProvidersWarning, hasAnyConfiguredProvider } from "./provider-availability"
import { ensureTuiPluginEntry } from "./config-manager/add-tui-plugin-to-tui-config"
import * as astGrepInstall from "./install-ast-grep-sg"
import { t } from "../shared/i18n"

export async function runTuiInstaller(args: InstallArgs, version: string): Promise<number> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(t("cli.tui-installer.requiresTty"))
    return 1
  }

  const selectedPlatform = await promptInstallPlatform(args.platform ?? "opencode")
  if (!selectedPlatform) return 1

  const hasOpenCode = selectedPlatform === "opencode" || selectedPlatform === "both"
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

  p.intro(color.bgMagenta(color.white(isUpdate ? t("cli.tui-installer.intro.update") : t("cli.tui-installer.intro.install"))))

  if (isUpdate) {
    const initial = detectedToInitialValues(detected)
    p.log.info(t("cli.tui-installer.existingConfig", { claude: initial.claude, gemini: initial.gemini }))
  }

  const spinner = p.spinner()
  if (hasOpenCode) {
    spinner.start(t("cli.tui-installer.checkingOpencode"))

    const installed = await isOpenCodeInstalled()
    const openCodeVersion = await getOpenCodeVersion()
    if (!installed) {
      spinner.stop(`${t("cli.tui-installer.opencodeNotFound")} ${color.yellow("[!]")}`)
      p.log.warn(t("cli.tui-installer.opencodeNotFoundDetail"))
      p.note(t("cli.tui-installer.installGuideBody"), t("cli.tui-installer.installGuideTitle"))
    } else {
      spinner.stop(`${t("cli.tui-installer.opencodeOk", { version: openCodeVersion ?? "installed" })} ${color.green("[OK]")}`)

      const unsupportedVersionMessage = getUnsupportedOpenCodeVersionMessage(openCodeVersion)
      if (unsupportedVersionMessage) {
        p.log.warn(unsupportedVersionMessage)
        p.outro(color.red(t("cli.tui-installer.installingBlocked")))
        return 1
      }
    }
  }

  const config = await promptInstallConfig(detected, selectedPlatform, args.codexAutonomous)
  if (!config) return 1

  if (config.hasOpenCode) {
    spinner.start(t("cli.tui-installer.addingPlugin", { pluginName: PLUGIN_NAME }))
    const pluginResult = await addPluginToOpenCodeConfig(version)
    if (!pluginResult.success) {
      spinner.stop(t("cli.tui-installer.failedAddPlugin", { error: pluginResult.error }))
      p.outro(color.red(t("cli.tui-installer.installFailed")))
      return 1
    }
    spinner.stop(t("cli.tui-installer.pluginAdded", { configPath: color.cyan(pluginResult.configPath) }))
    try {
      ensureTuiPluginEntry()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      p.log.warn(t("cli.tui-installer.couldNotUpdateTui", { message }))
    }

    spinner.start(t("cli.tui-installer.writingConfig", { pluginName: PLUGIN_NAME }))
    const omoResult = writeOmoConfig(config)
    if (!omoResult.success) {
      spinner.stop(t("cli.tui-installer.failedWriteConfig", { error: omoResult.error }))
      p.outro(color.red(t("cli.tui-installer.installFailed")))
      return 1
    }
    spinner.stop(t("cli.tui-installer.configWritten", { configPath: color.cyan(omoResult.configPath) }))
    await astGrepInstall.installAstGrepForOpenCode({ log: p.log.warn })
  }

  if (config.hasOpenCode && !config.hasClaude) {
    p.log.info(
      `${color.bold("Note:")} Sisyphus agent performs best with Claude Opus 5.\n` +
        `Other models work but may have reduced orchestration quality.`,
    )
  }

  if (config.hasOpenCode && !hasAnyConfiguredProvider(config)) {
    p.log.warn(getNoModelProvidersWarning())
  }

  p.note(formatConfigSummary(config), isUpdate ? t("cli.tui-installer.note.updatedConfig") : t("cli.tui-installer.note.installComplete"))

  if (config.hasCodex) {
    const codexInstallation = await detectCodexInstallation()
    if (!codexInstallation.found) {
      p.log.warn(formatCodexInstallationWarning(codexInstallation))
    }

    spinner.start(t("cli.tui-installer.installingCodex"))
    try {
      const codexResult = await runCodexInstaller({ autonomousPermissions: config.codexAutonomous })
      spinner.stop(t("cli.tui-installer.codexInstalled", { configPath: color.cyan(codexResult.configPath) }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      spinner.stop(`${t("cli.tui-installer.codexInstallFailedShort")} ${color.yellow("[!]")}`)
      if (!config.hasOpenCode) {
        p.log.error(t("cli.tui-installer.codexInstallFailed", { message }))
        p.outro(color.red(t("cli.tui-installer.installFailed")))
        return 1
      }
      p.log.warn(t("cli.tui-installer.codexInstallFailedOcOk", { message }))
    }
  }

  if (config.hasSenpi) {
    spinner.start("Installing Senpi harness adapter")
    try {
      const senpiResult = await runSenpiInstaller()
      spinner.stop(`Senpi adapter installed to ${color.cyan(senpiResult.settingsPath)}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      spinner.stop(`Senpi install failed ${color.yellow("[!]")}`)
      p.log.error(`Senpi install failed: ${message}`)
      p.outro(color.red("Installation failed."))
      return 1
    }
  }

  p.log.success(color.bold(isUpdate ? t("cli.tui-installer.configUpdated") : t("cli.tui-installer.installComplete")))
  if (config.hasOpenCode) {
    p.log.message(t("cli.tui-installer.runToStart", { command: color.cyan("opencode") }))
  }
  p.log.info(t("cli.tui-installer.telemetryNote"))
  p.log.info(t("cli.tui-installer.docsNote"))

  p.note(
    t("cli.tui-installer.magicWordBody", { word: color.cyan("ultrawork"), wordShort: color.cyan("ulw") }),
    t("cli.tui-installer.magicWordTitle"),
  )

  const shouldStar = await p.confirm({
    message: t("cli.tui-installer.starQuestion"),
    initialValue: false,
  })
  if (!p.isCancel(shouldStar) && shouldStar) {
    spinner.start(t("cli.tui-installer.starring"))
    const results = await starGitHubRepositories(selectedPlatform)
    const failed = results.filter((result) => !result.ok)
    if (failed.length === 0) {
      spinner.stop(t("cli.tui-installer.starred"))
    } else {
      spinner.stop(t("cli.tui-installer.couldNotStar"))
      p.log.warn(t("cli.tui-installer.starAuthHint"))
    }
  }

  p.outro(color.green(t("cli.tui-installer.enjoy")))

  if (config.hasOpenCode && (config.hasClaude || config.hasGemini || config.hasCopilot) && !args.skipAuth) {
    const providers: string[] = []
    if (config.hasClaude) providers.push(`${t("cli.tui-installer.authProviderAnthropic")} ${color.gray(`→ ${t("cli.tui-installer.authProviderAnthropicHint")}`)}`)
    if (config.hasGemini) providers.push(`${t("cli.tui-installer.authProviderGoogle")} ${color.gray(`→ ${t("cli.tui-installer.authProviderGoogleHint")}`)}`)
    if (config.hasCopilot) providers.push(`${t("cli.tui-installer.authProviderGithub")} ${color.gray(`→ ${t("cli.tui-installer.authProviderGithubHint")}`)}`)

    console.log()
    console.log(color.bold(t("cli.tui-installer.authTitle")))
    console.log()
    console.log(t("cli.tui-installer.authRunHint", { command: color.cyan("opencode auth login") }))
    for (const provider of providers) {
      console.log(`   ${SYMBOLS.bullet} ${provider}`)
    }
    console.log()
  }

  return 0
}
