import { createOpencode as createOpencodeSdk, createOpencodeClient as createOpencodeClientSdk } from "@opencode-ai/sdk"
import pc from "picocolors"
import type { ServerConnection } from "./types"
import { injectServerAuthIntoClient } from "../../shared/opencode-server-auth"
import { getAvailableServerPort, isPortAvailable, DEFAULT_SERVER_PORT } from "../../shared/port-utils"
import { withWorkingOpencodePath } from "./opencode-binary-resolver"
import { t } from "../../shared/i18n"

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]", "0.0.0.0"])

export type ServerConnectionOptions = {
  port?: number
  attach?: string
  signal: AbortSignal
}

type OpencodeServer<TClient> = {
  client: TClient
  server: {
    url: string
    close: () => void
  }
}

export type ServerConnectionDeps<TClient> = {
  createOpencode: (options: { signal: AbortSignal, port: number, hostname: string }) => Promise<OpencodeServer<TClient>>
  createOpencodeClient: (options: { baseUrl: string }) => TClient
  injectServerAuthIntoClient: (client: TClient) => void
  isPortAvailable: (port: number, hostname?: string) => Promise<boolean>
  getAvailableServerPort: (preferredPort?: number, hostname?: string) => Promise<{ port: number, wasAutoSelected: boolean }>
  withWorkingOpencodePath: (
    startServer: () => Promise<OpencodeServer<TClient>>,
  ) => Promise<OpencodeServer<TClient>>
}

const defaultDeps: ServerConnectionDeps<ServerConnection["client"]> = {
  createOpencode: createOpencodeSdk,
  createOpencodeClient: createOpencodeClientSdk,
  injectServerAuthIntoClient,
  isPortAvailable,
  getAvailableServerPort,
  withWorkingOpencodePath,
}

function isLoopbackAttachUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return LOOPBACK_HOSTS.has(parsed.hostname)
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error
    }
    return false
  }
}

function isPortStartFailure(error: unknown, port: number): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes(`Failed to start server on port ${port}`)
}

function isPortRangeExhausted(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes("No available port found in range")
}

async function startServer<TClient>(
  options: { signal: AbortSignal, port: number },
  deps: ServerConnectionDeps<TClient>,
): Promise<{ client: TClient, cleanup: () => void }> {
  const { signal, port } = options
  const { client, server } = await deps.withWorkingOpencodePath(() =>
    deps.createOpencode({ signal, port, hostname: "127.0.0.1" }),
  )

  deps.injectServerAuthIntoClient(client)
  console.log(pc.dim(t("cli.run.server.listeningAt")), pc.cyan(server.url))
  return { client, cleanup: () => server.close() }
}

export async function createServerConnectionWithDeps<TClient>(
  options: ServerConnectionOptions,
  deps: ServerConnectionDeps<TClient>,
): Promise<{ client: TClient, cleanup: () => void }> {
  const { port, attach, signal } = options

  if (attach !== undefined) {
    console.log(pc.dim(t("cli.run.server.attachingTo")), pc.cyan(attach))
    const client = deps.createOpencodeClient({ baseUrl: attach })
    if (isLoopbackAttachUrl(attach)) {
      deps.injectServerAuthIntoClient(client)
    }
    return { client, cleanup: () => {} }
  }

  if (port !== undefined) {
    if (port < 1 || port > 65535) {
      throw new Error("Port must be between 1 and 65535")
    }

    const available = await deps.isPortAvailable(port, "127.0.0.1")

    if (available) {
      console.log(pc.dim(t("cli.run.server.startingOnPort")), pc.cyan(port.toString()))
      try {
        return await startServer({ signal, port }, deps)
      } catch (error) {
        if (!isPortStartFailure(error, port)) {
          throw error
        }

        const stillAvailable = await deps.isPortAvailable(port, "127.0.0.1")
        if (stillAvailable) {
          throw error
        }

        console.log(pc.dim(t("cli.run.server.portPrefix")), pc.cyan(port.toString()), pc.dim(t("cli.run.server.becameOccupied")))
        const client = deps.createOpencodeClient({ baseUrl: `http://127.0.0.1:${port}` })
        deps.injectServerAuthIntoClient(client)
        return { client, cleanup: () => {} }
      }
    }

    console.log(pc.dim(t("cli.run.server.portPrefix")), pc.cyan(port.toString()), pc.dim(t("cli.run.server.isOccupied")))
    const client = deps.createOpencodeClient({ baseUrl: `http://127.0.0.1:${port}` })
    deps.injectServerAuthIntoClient(client)
    return { client, cleanup: () => {} }
  }

  let selectedPort: number
  let wasAutoSelected: boolean
  try {
    const selected = await deps.getAvailableServerPort(DEFAULT_SERVER_PORT, "127.0.0.1")
    selectedPort = selected.port
    wasAutoSelected = selected.wasAutoSelected
  } catch (error) {
    if (!isPortRangeExhausted(error)) {
      throw error
    }

    const defaultPortIsAvailable = await deps.isPortAvailable(DEFAULT_SERVER_PORT, "127.0.0.1")
    if (defaultPortIsAvailable) {
      throw error
    }

    console.log(pc.dim(t("cli.run.server.portRangeExhausted")), pc.cyan(DEFAULT_SERVER_PORT.toString()))
    const client = deps.createOpencodeClient({ baseUrl: `http://127.0.0.1:${DEFAULT_SERVER_PORT}` })
    deps.injectServerAuthIntoClient(client)
    return { client, cleanup: () => {} }
  }

  if (wasAutoSelected) {
    console.log(pc.dim(t("cli.run.server.autoSelectedPort")), pc.cyan(selectedPort.toString()))
  } else {
    console.log(pc.dim(t("cli.run.server.startingOnPort")), pc.cyan(selectedPort.toString()))
  }

  try {
    return await startServer({ signal, port: selectedPort }, deps)
  } catch (error) {
    if (!isPortStartFailure(error, selectedPort)) {
      throw error
    }

    const { port: retryPort } = await deps.getAvailableServerPort(selectedPort + 1, "127.0.0.1")
    console.log(pc.dim(t("cli.run.server.retryingStart")), pc.cyan(retryPort.toString()))
    return await startServer({ signal, port: retryPort }, deps)
  }
}

export async function createServerConnection(options: ServerConnectionOptions): Promise<ServerConnection> {
  return await createServerConnectionWithDeps(options, defaultDeps)
}
