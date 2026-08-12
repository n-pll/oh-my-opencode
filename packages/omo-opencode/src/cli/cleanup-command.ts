import { Option, type Command } from "commander"
import { cleanup, resolveCleanupPlatform } from "./cleanup"
import type { CleanupOptions } from "./cleanup"
import { t } from "../shared/i18n"

type CleanupCommandOptions = {
  readonly platform?: CleanupOptions["platform"]
  readonly codexHome?: CleanupOptions["codexHome"]
  readonly project?: CleanupOptions["project"]
  readonly json?: CleanupOptions["json"]
}

type CleanupRootCommandOptions = {
  readonly platform?: CleanupOptions["platform"]
}

export { resolveCleanupPlatform }

export function configureCleanupCommand(program: Command): void {
  program
    .command("cleanup")
    .alias("uninstall")
    .description(t("cli.cleanup.description"))
    .addOption(new Option("--platform <platform>", t("cli.cleanup.option.platform")).choices(["codex"]))
    .option("--codex-home <path>", t("cli.cleanup.option.codexHome"))
    .option("--project <path>", t("cli.cleanup.option.project"))
    .option("--json", t("cli.cleanup.option.json"))
    .addHelpText("after", `
Examples:
  $ npx lazycodex-ai uninstall
  $ omo uninstall --platform=codex
  $ npx lazycodex-ai cleanup
  $ omo cleanup --platform=codex
  $ omo uninstall --platform=codex --project /path/to/project
`)
    .action(async (options: CleanupCommandOptions) => {
      const rootOptions = program.opts<CleanupRootCommandOptions>()
      const platform = resolveCleanupPlatform({ platform: options.platform ?? rootOptions.platform })
      const exitCode = await cleanup({
        platform,
        codexHome: options.codexHome,
        project: options.project,
        json: options.json ?? false,
      })
      process.exit(exitCode)
    })
}
