import { Command } from "commander"
import { login } from "./login"
import { logout } from "./logout"
import { status } from "./status"
import { t } from "../../shared/i18n"

export function createMcpOAuthCommand(): Command {
  const mcp = new Command("mcp").description(t("cli.mcpOAuth.mcp.description"))

  const oauth = new Command("oauth").description(t("cli.mcpOAuth.oauth.description"))

  oauth
    .command("login <server-name>")
    .description(t("cli.mcpOAuth.login.description"))
    .option("--server-url <url>", t("cli.mcpOAuth.login.option.serverUrl"))
    .option("--client-id <id>", t("cli.mcpOAuth.login.option.clientId"))
    .option("--scopes <scopes...>", t("cli.mcpOAuth.login.option.scopes"))
    .action(async (serverName: string, options) => {
      const exitCode = await login(serverName, options)
      process.exit(exitCode)
    })

  oauth
    .command("logout <server-name>")
    .description(t("cli.mcpOAuth.logout.description"))
    .option("--server-url <url>", t("cli.mcpOAuth.logout.option.serverUrl"))
    .action(async (serverName: string, options) => {
      const exitCode = await logout(serverName, options)
      process.exit(exitCode)
    })

  oauth
    .command("status [server-name]")
    .description(t("cli.mcpOAuth.status.description"))
    .action(async (serverName: string | undefined) => {
      const exitCode = await status(serverName)
      process.exit(exitCode)
    })

  mcp.addCommand(oauth)
  return mcp
}

export { login, logout, status }
