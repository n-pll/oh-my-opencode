import { McpOAuthProvider } from "@oh-my-opencode/mcp-client-core/mcp-oauth/provider"
import { t } from "../../shared/i18n"

export interface LoginOptions {
  serverUrl?: string
  clientId?: string
  scopes?: string[]
}

export type McpOAuthProviderLike = Pick<McpOAuthProvider, "login">

export interface LoginDependencies {
  createProvider: (options: Required<Pick<LoginOptions, "serverUrl">> & Omit<LoginOptions, "serverUrl">) => McpOAuthProviderLike
}

const defaultLoginDependencies: LoginDependencies = {
  createProvider: (options) => new McpOAuthProvider(options),
}

export async function login(
  serverName: string,
  options: LoginOptions,
  deps: LoginDependencies = defaultLoginDependencies,
): Promise<number> {
  try {
    const serverUrl = options.serverUrl
    if (!serverUrl) {
      console.error(t("cli.mcp-oauth.login.serverUrlRequired", { serverName }))
      return 1
    }

    const provider = deps.createProvider({
      serverUrl,
      clientId: options.clientId,
      scopes: options.scopes,
    })

    console.log(t("cli.mcp-oauth.login.authenticating", { serverName }))
    const tokenData = await provider.login()

    console.log(t("cli.mcp-oauth.login.success", { serverName }))
    if (tokenData.expiresAt) {
      const expiryDate = new Date(tokenData.expiresAt * 1000)
      console.log(t("cli.mcp-oauth.login.tokenExpiresAt", { date: expiryDate.toISOString() }))
    }

    return 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(t("cli.mcp-oauth.login.failed", { serverName, message }))
    return 1
  }
}
