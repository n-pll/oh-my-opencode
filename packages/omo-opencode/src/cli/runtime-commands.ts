import type { Command } from "commander"

import { boulder } from "./boulder"
import { codexUlwLoop } from "./codex-ulw-loop"
import { refreshModelCapabilities } from "./refresh-model-capabilities"
import { PLUGIN_NAME } from "../shared"
import { t } from "../shared/i18n"
import packageJson from "../../../../package.json" with { type: "json" }

const VERSION = packageJson.version

export function configureRuntimeCommands(program: Command): void {
  program
    .command("refresh-model-capabilities")
    .description(t("cli.program.refresh.description"))
    .option("-d, --directory <path>", t("cli.program.refresh.option.directory"))
    .option("--source-url <url>", t("cli.program.refresh.option.sourceUrl"))
    .option("--json", t("cli.program.refresh.option.json"))
    .action(async (options: { readonly directory?: string; readonly sourceUrl?: string; readonly json?: boolean }) => {
      const exitCode = await refreshModelCapabilities({
        directory: options.directory,
        sourceUrl: options.sourceUrl,
        json: options.json ?? false,
      })
      process.exit(exitCode)
    })

  program
    .command("version")
    .description(t("cli.program.version.description"))
    .action(() => {
      console.log(`${PLUGIN_NAME} v${VERSION}`)
    })

  program
    .command("boulder")
    .description(t("cli.program.boulder.description"))
    .option("-d, --directory <path>", t("cli.program.boulder.option.directory"))
    .option("-w, --work-id <id>", t("cli.program.boulder.option.workId"))
    .option("--json", t("cli.program.boulder.option.json"))
    .action(async (options: { readonly directory?: string; readonly workId?: string; readonly json?: boolean }) => {
      const exitCode = await boulder({
        directory: options.directory,
        workId: options.workId,
        json: options.json ?? false,
      })
      process.exit(exitCode)
    })

  program
    .command("ulw-loop [args...]")
    .allowUnknownOption()
    .passThroughOptions()
    .description(t("cli.program.ulwLoop.description"))
    .action(async (args: string[] = []) => {
      const exitCode = await codexUlwLoop(args)
      process.exit(exitCode)
    })
}
