import { listAllTokens, listTokensByHost } from "@oh-my-opencode/mcp-client-core/mcp-oauth/storage"
import { t } from "../../shared/i18n"

export async function status(serverName: string | undefined): Promise<number> {
  try {
    if (serverName) {
      const tokens = listTokensByHost(serverName)

      if (Object.keys(tokens).length === 0) {
        console.log(t("cli.mcp-oauth.status.noTokensFor", { serverName }))
        return 0
      }

      console.log(t("cli.mcp-oauth.status.header", { serverName }))
      for (const [key, token] of Object.entries(tokens)) {
        console.log(`  ${key}:`)
        console.log(`    ${t("cli.mcp-oauth.status.accessToken")}`)
        if (token.refreshToken) {
          console.log(`    ${t("cli.mcp-oauth.status.refreshToken")}`)
        }
        if (token.expiresAt) {
          const expiryDate = new Date(token.expiresAt * 1000)
          const now = Date.now() / 1000
          const isExpired = token.expiresAt < now
          const tokenStatus = isExpired ? "EXPIRED" : "VALID"
          console.log(`    ${t("cli.mcp-oauth.status.expiry", { date: expiryDate.toISOString(), status: tokenStatus })}`)
        }
      }
      return 0
    }

    const tokens = listAllTokens()
    if (Object.keys(tokens).length === 0) {
      console.log(t("cli.mcp-oauth.status.noTokensStored"))
      return 0
    }

    console.log(t("cli.mcp-oauth.status.storedHeader"))
    for (const [key, token] of Object.entries(tokens)) {
      const isExpired = token.expiresAt && token.expiresAt < Date.now() / 1000
      const tokenStatus = isExpired ? "EXPIRED" : "VALID"
      console.log(`  ${key}: ${tokenStatus}`)
    }

    return 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(t("cli.mcp-oauth.status.getStatusError", { message }))
    return 1
  }
}
