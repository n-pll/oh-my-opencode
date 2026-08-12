import { Command, Option } from "commander"
import { install } from "./install"
import { configureCleanupCommand, resolveCleanupPlatform } from "./cleanup-command"
import { run } from "./run"
import { getLocalVersion } from "./get-local-version"
import { doctor, resolveDoctorTarget } from "./doctor"
import { createMcpOAuthCommand } from "./mcp-oauth"
import { configureRuntimeCommands } from "./runtime-commands"
import { runConfigMigrate } from "./config-migrate"
import { availableInstallPlatforms, isSenpiPlatformEnabled, SENPI_PLATFORM_ENV_FLAG } from "./senpi-platform-flag"
import type { InstallArgs } from "./types"
import type { RunOptions } from "./run"
import type { GetLocalVersionOptions } from "./get-local-version/types"
import type { DoctorOptions } from "./doctor"
import packageJson from "../../../../package.json" with { type: "json" }
import { t } from "../shared/i18n"

const VERSION = packageJson.version

const program = new Command()

type InstallCommandOptions = {
  readonly tui?: boolean
  readonly claude?: InstallArgs["claude"]
  readonly openai?: InstallArgs["openai"]
  readonly gemini?: InstallArgs["gemini"]
  readonly copilot?: InstallArgs["copilot"]
  readonly platform?: InstallArgs["platform"]
  readonly opencodeZen?: InstallArgs["opencodeZen"]
  readonly zaiCodingPlan?: InstallArgs["zaiCodingPlan"]
  readonly kimiForCoding?: InstallArgs["kimiForCoding"]
  readonly opencodeGo?: InstallArgs["opencodeGo"]
  readonly bailianCodingPlan?: InstallArgs["bailianCodingPlan"]
  readonly minimaxCnCodingPlan?: InstallArgs["minimaxCnCodingPlan"]
  readonly minimaxCodingPlan?: InstallArgs["minimaxCodingPlan"]
  readonly vercelAiGateway?: InstallArgs["vercelAiGateway"]
  readonly codexAutonomous?: InstallArgs["codexAutonomous"]
  readonly skipAuth?: boolean
}

type RootCommandOptions = {
  readonly platform?: InstallArgs["platform"]
}

type ConfigMigrateCommandOptions = {
  readonly dryRun?: boolean
  readonly json?: boolean
}

type DoctorCommandOptions = {
  readonly status?: boolean
  readonly verbose?: boolean
  readonly json?: boolean
  readonly platform?: DoctorOptions["target"]
}

export function resolveInstallArgs(
  options: InstallCommandOptions,
  invocationName: string | undefined = process.env.OMO_INVOCATION_NAME,
): InstallArgs {
  const defaultPlatform = invocationName === "lazycodex" || invocationName === "lazycodex-ai" ? "codex" : undefined
  const platform = options.platform ?? defaultPlatform
  if (platform === "senpi" && !isSenpiPlatformEnabled()) {
    throw new Error(
      t("cli.program.install.error.senpiUnavailable", { flag: SENPI_PLATFORM_ENV_FLAG }),
    )
  }

  return {
    tui: options.tui !== false,
    claude: options.claude,
    openai: options.openai,
    gemini: options.gemini,
    copilot: options.copilot,
    platform,
    opencodeZen: options.opencodeZen,
    zaiCodingPlan: options.zaiCodingPlan,
    kimiForCoding: options.kimiForCoding,
    opencodeGo: options.opencodeGo,
    bailianCodingPlan: options.bailianCodingPlan,
    minimaxCnCodingPlan: options.minimaxCnCodingPlan,
    minimaxCodingPlan: options.minimaxCodingPlan,
    vercelAiGateway: options.vercelAiGateway,
    codexAutonomous: options.codexAutonomous,
    skipAuth: options.skipAuth ?? false,
  }
}

export { resolveCleanupPlatform }

program
  .name("oh-my-opencode")
  .description(t("cli.program.description"))
  .version(VERSION, "-v, --version", t("cli.program.help.version"))
  .helpOption("-h, --help", t("cli.program.help.help"))
  .addOption(new Option("--platform <platform>", t("cli.program.option.platform", { platforms: availableInstallPlatforms().join(", ") })).choices(availableInstallPlatforms()).hideHelp())
  .enablePositionalOptions()

program
  .command("install")
  .alias("setup")
  .description(t("cli.program.install.description"))
  .option("--no-tui", t("cli.program.install.option.noTui"))
  .option("--claude <value>", t("cli.program.install.option.claude"))
  .option("--openai <value>", t("cli.program.install.option.openai"))
  .option("--gemini <value>", t("cli.program.install.option.gemini"))
  .option("--copilot <value>", t("cli.program.install.option.copilot"))
  .addOption(new Option("--platform <platform>", t("cli.program.option.platform", { platforms: availableInstallPlatforms().join(", ") })).choices(availableInstallPlatforms()))
  .option("--opencode-zen <value>", t("cli.program.install.option.opencodeZen"))
  .option("--zai-coding-plan <value>", t("cli.program.install.option.zaiCodingPlan"))
  .option("--kimi-for-coding <value>", t("cli.program.install.option.kimiForCoding"))
  .option("--opencode-go <value>", t("cli.program.install.option.opencodeGo"))
  .option("--bailian-coding-plan <value>", t("cli.program.install.option.bailianCodingPlan"))
  .option("--minimax-cn-coding-plan <value>", t("cli.program.install.option.minimaxCnCodingPlan"))
  .option("--minimax-coding-plan <value>", t("cli.program.install.option.minimaxCodingPlan"))
  .option("--vercel-ai-gateway <value>", t("cli.program.install.option.vercelAiGateway"))
  .option("--codex-autonomous", t("cli.program.install.option.codexAutonomous"))
  .option("--no-codex-autonomous", t("cli.program.install.option.noCodexAutonomous"))
  .option("--skip-auth", t("cli.program.install.option.skipAuth"))
.addHelpText("after", `
${t("cli.program.install.help.examples")}
  $ bunx oh-my-opencode install
  $ npx lazycodex-ai install --no-tui
  $ bunx oh-my-opencode install --no-tui --platform=both --claude=max20 --openai=yes --gemini=yes --copilot=no
  $ omo install --platform=codex --codex-autonomous
  $ bunx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=yes --opencode-zen=yes

${t("cli.program.install.help.modelProviders")}
${t("cli.program.install.help.provider.claude")}
${t("cli.program.install.help.provider.openai")}
${t("cli.program.install.help.provider.gemini")}
${t("cli.program.install.help.provider.copilot")}
${t("cli.program.install.help.provider.opencodeZen")}
${t("cli.program.install.help.provider.zai")}
${t("cli.program.install.help.provider.kimi")}
${t("cli.program.install.help.provider.bailian")}
${t("cli.program.install.help.provider.minimax")}
${t("cli.program.install.help.provider.minimaxCn")}
${t("cli.program.install.help.provider.vercel")}
`)
  .action(async (options: InstallCommandOptions) => {
    const rootOptions = program.opts<RootCommandOptions>()
    const args = resolveInstallArgs({ ...options, platform: options.platform ?? rootOptions.platform })
    const exitCode = await install(args)
    process.exit(exitCode)
  })

configureCleanupCommand(program)

program
   .command("run <message>")
   .allowUnknownOption()
   .passThroughOptions()
  .description(t("cli.program.run.description"))
  .option("-a, --agent <name>", t("cli.program.run.option.agent"))
  .option("-m, --model <provider/model>", t("cli.program.run.option.model"))
  .option("-d, --directory <path>", t("cli.program.run.option.directory"))
  .option("-p, --port <port>", t("cli.program.run.option.port"), parseInt)
  .option("--attach <url>", t("cli.program.run.option.attach"))
  .option("--on-complete <command>", t("cli.program.run.option.onComplete"))
  .option("--json", t("cli.program.run.option.json"))
  .option("--no-timestamp", t("cli.program.run.option.noTimestamp"))
  .option("--verbose", t("cli.program.run.option.verbose"))
  .option("--session-id <id>", t("cli.program.run.option.sessionId"))
  .addHelpText("after", `
${t("cli.program.run.help.examples")}
  $ bunx oh-my-opencode run "Fix the bug in index.ts"
  $ bunx oh-my-opencode run --agent Sisyphus "Implement feature X"
  $ bunx oh-my-opencode run --port 4321 "Fix the bug"
  $ bunx oh-my-opencode run --attach http://127.0.0.1:4321 "Fix the bug"
  $ bunx oh-my-opencode run --json "Fix the bug" | jq .sessionId
  $ bunx oh-my-opencode run --on-complete "notify-send Done" "Fix the bug"
  $ bunx oh-my-opencode run --session-id ses_abc123 "Continue the work"
  $ bunx oh-my-opencode run --model anthropic/claude-sonnet-4 "Fix the bug"
  $ bunx oh-my-opencode run --agent Sisyphus --model openai/gpt-5.6-sol "Implement feature X"

${t("cli.program.run.help.agentResolution")}
${t("cli.program.run.help.agentResolution.flag")}
${t("cli.program.run.help.agentResolution.env")}
${t("cli.program.run.help.agentResolution.config")}
${t("cli.program.run.help.agentResolution.fallback")}

${t("cli.program.run.help.availableAgents")}
${t("cli.program.run.help.availableAgentsList")}

${t("cli.program.run.help.waitsUntil")}
${t("cli.program.run.help.waitsUntil.todos")}
${t("cli.program.run.help.waitsUntil.sessions")}
`)
  .action(async (message: string, options) => {
    if (options.port && options.attach) {
      console.error(t("cli.program.run.error.portAttachExclusive"))
      process.exit(1)
    }
    const runOptions: RunOptions = {
      message,
      agent: options.agent,
      model: options.model,
      directory: options.directory,
      port: options.port,
      attach: options.attach,
      onComplete: options.onComplete,
      json: options.json ?? false,
      timestamp: options.timestamp ?? true,
      verbose: options.verbose ?? false,
      sessionId: options.sessionId,
    }
    const exitCode = await run(runOptions)
    process.exit(exitCode)
  })

program
  .command("get-local-version")
  .description(t("cli.program.getLocalVersion.description"))
  .option("-d, --directory <path>", t("cli.program.getLocalVersion.option.directory"))
  .option("--json", t("cli.program.getLocalVersion.option.json"))
  .addHelpText("after", `
${t("cli.program.getLocalVersion.help.examples")}
  $ bunx oh-my-opencode get-local-version
  $ bunx oh-my-opencode get-local-version --json
  $ bunx oh-my-opencode get-local-version --directory /path/to/project

${t("cli.program.getLocalVersion.help.shows")}
${t("cli.program.getLocalVersion.help.shows.currentVersion")}
${t("cli.program.getLocalVersion.help.shows.latestVersion")}
${t("cli.program.getLocalVersion.help.shows.upToDate")}
${t("cli.program.getLocalVersion.help.shows.specialModes")}
`)
  .action(async (options) => {
    const versionOptions: GetLocalVersionOptions = {
      directory: options.directory,
      json: options.json ?? false,
    }
    const exitCode = await getLocalVersion(versionOptions)
    process.exit(exitCode)
  })

program
  .command("doctor")
  .description(t("cli.program.doctor.description"))
  .option("--status", t("cli.program.doctor.option.status"))
  .option("--verbose", t("cli.program.doctor.option.verbose"))
  .option("--json", t("cli.program.doctor.option.json"))
  .addOption(new Option("--platform <platform>", t("cli.program.doctor.option.platform")).choices(["opencode", "codex"]))
  .addHelpText("after", `
${t("cli.program.doctor.help.examples")}
${t("cli.program.doctor.help.showProblems")}
${t("cli.program.doctor.help.dashboard")}
${t("cli.program.doctor.help.diagnostics")}
${t("cli.program.doctor.help.jsonOutput")}
${t("cli.program.doctor.help.codex")}
`)
  .action(async (options: DoctorCommandOptions) => {
    const rootOptions = program.opts<RootCommandOptions>()
    const rootDoctorPlatform = rootOptions.platform === "opencode" || rootOptions.platform === "codex" ? rootOptions.platform : undefined
    const mode = options.status ? "status" : options.verbose ? "verbose" : "default"
    const doctorOptions: DoctorOptions = {
      mode,
      json: options.json ?? false, target: resolveDoctorTarget(process.env.OMO_INVOCATION_NAME, options.platform ?? rootDoctorPlatform),
    }
    const exitCode = await doctor(doctorOptions)
    process.exit(exitCode)
  })

program
  .command("config")
  .description(t("cli.program.config.description"))
  .command("migrate")
  .description(t("cli.program.config.migrate.description"))
  .option("--dry-run", t("cli.program.config.migrate.option.dryRun"))
  .option("--json", t("cli.program.config.migrate.option.json"))
  .action((options: ConfigMigrateCommandOptions) => {
    const exitCode = runConfigMigrate({ dryRun: options.dryRun ?? false, json: options.json ?? false })
    process.exit(exitCode)
  })

configureRuntimeCommands(program)

program.addCommand(createMcpOAuthCommand())

export function runCli(): void {
  program.parse()
}
