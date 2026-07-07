import { deleteToken } from "@oh-my-opencode/mcp-client-core/mcp-oauth/storage"
import { t } from "../../shared/i18n"

export interface LogoutOptions {
  serverUrl?: string
}

export async function logout(serverName: string, options?: LogoutOptions): Promise<number> {
  try {
    const serverUrl = options?.serverUrl
    if (!serverUrl) {
      console.error(t("cli.mcp-oauth.logout.serverUrlRequired"))
      console.error(t("cli.mcp-oauth.logout.usageHint", { serverName }))
      return 1
    }

    const success = deleteToken(serverUrl, serverUrl)

    if (success) {
      console.log(t("cli.mcp-oauth.logout.success", { serverName }))
      return 0
    }

    console.error(t("cli.mcp-oauth.logout.failed", { serverName }))
    return 1
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(t("cli.mcp-oauth.logout.failedWithMessage", { serverName, message }))
    return 1
  }
}
