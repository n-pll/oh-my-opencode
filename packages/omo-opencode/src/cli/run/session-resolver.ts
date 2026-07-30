import pc from "picocolors"
import { PUBLISHED_PACKAGE_NAME } from "../../shared"
import type { OpencodeClient } from "./types"
import { serializeError } from "./events"
import { t } from "../../shared/i18n"

const SESSION_CREATE_MAX_RETRIES = 3
const SESSION_CREATE_RETRY_DELAY_MS = 1000

export async function resolveSession(options: {
  client: OpencodeClient
  sessionId?: string
  directory: string
  retryDelayMs?: number
}): Promise<string> {
  const { client, sessionId, directory } = options
  const retryDelayMs = options.retryDelayMs ?? SESSION_CREATE_RETRY_DELAY_MS

  if (sessionId) {
    const res = await client.session.get({
      path: { id: sessionId },
      query: { directory },
    })
    if (res.error || !res.data) {
      throw new Error(t("cli.run.session.sessionNotFound", { sessionId }))
    }
    return sessionId
  }

  for (let attempt = 1; attempt <= SESSION_CREATE_MAX_RETRIES; attempt++) {
    const res = await client.session.create({
      body: {
        title: `${PUBLISHED_PACKAGE_NAME} run`,
        permission: [
          { permission: "question", action: "deny" as const, pattern: "*" },
        ],
      } as Record<string, unknown>,
      query: { directory },
    })

    if (res.error) {
      console.error(
        pc.yellow(t("cli.run.session.createAttemptFailed", { attempt, max: SESSION_CREATE_MAX_RETRIES }))
      )
      console.error(pc.dim(t("cli.run.session.createError", { message: serializeError(res.error) })))

      if (attempt < SESSION_CREATE_MAX_RETRIES) {
        const delay = retryDelayMs * attempt
        console.log(pc.dim(t("cli.run.session.retryingIn", { delay })))
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      continue
    }

    if (res.data?.id) {
      return res.data.id
    }

    console.error(
      pc.yellow(
        `Session create attempt ${attempt}/${SESSION_CREATE_MAX_RETRIES}: No session ID returned`
      )
    )

    if (attempt < SESSION_CREATE_MAX_RETRIES) {
      const delay = retryDelayMs * attempt
      console.log(pc.dim(`  Retrying in ${delay}ms...`))
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Failed to create session after all retries")
}
