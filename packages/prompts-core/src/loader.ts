import { parseFrontmatter } from "@oh-my-opencode/utils"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { isAbsolute, relative, resolve } from "node:path"
import type {
  LoadedPrompt,
  LoadBundledPromptInput,
  LoadFilesystemPromptInput,
  LoadPromptInput,
  RuntimeInjection,
  SyncRuntimeInjection,
} from "./types"

export class PromptFileNotFoundError extends Error {
  readonly name = "PromptFileNotFoundError"

  constructor(
    readonly promptName: string,
    readonly variant: string,
    readonly filePath: string,
    options?: ErrorOptions
  ) {
    super(`Prompt file not found for ${promptName}/${variant}: ${filePath}`, options)
  }
}

export class PromptPathTraversalError extends Error {
  readonly name = "PromptPathTraversalError"

  constructor(
    readonly promptName: string,
    readonly variant: string
  ) {
    super(`Prompt path escapes source directory for ${promptName}/${variant}`)
  }
}

export function loadPrompt<TFrontmatter = Record<string, unknown>>(
  input: LoadBundledPromptInput
): LoadedPrompt<TFrontmatter>
export function loadPrompt<TFrontmatter = Record<string, unknown>>(
  input: LoadFilesystemPromptInput
): Promise<LoadedPrompt<TFrontmatter>>
export function loadPrompt<TFrontmatter = Record<string, unknown>>(
  input: LoadPromptInput
): LoadedPrompt<TFrontmatter> | Promise<LoadedPrompt<TFrontmatter>> {
  if (isLoadBundledPromptInput(input)) return loadBundledPrompt(input)
  return loadFilesystemPrompt(input)
}

export function loadPromptSync<TFrontmatter = Record<string, unknown>>(
  input: LoadBundledPromptInput
): LoadedPrompt<TFrontmatter> {
  return loadBundledPrompt(input)
}

function isLoadBundledPromptInput(input: LoadPromptInput): input is LoadBundledPromptInput {
  return input.source.kind === "bundled"
}

async function loadFilesystemPrompt<TFrontmatter = Record<string, unknown>>(
  input: LoadFilesystemPromptInput
): Promise<LoadedPrompt<TFrontmatter>> {
  const filePath = resolvePromptFilePath(input.source.baseDir, input.name, input.variant, input.locale)
  const content = await readPromptFile(input.name, input.variant, filePath)
  const parsed = parseFrontmatter<TFrontmatter>(content)
  const body = await applyRuntimeInjections(parsed.body, input.inject ?? [])

  return {
    frontmatter: parsed.data,
    body,
    hadFrontmatter: parsed.hadFrontmatter,
    parseError: parsed.parseError,
    filePath,
  }
}

function loadBundledPrompt<TFrontmatter = Record<string, unknown>>(
  input: LoadBundledPromptInput
): LoadedPrompt<TFrontmatter> {
  const content = selectBundledContent(input.source, input.locale)
  const parsed = parseFrontmatter<TFrontmatter>(content)
  const body = applyRuntimeInjectionsSync(parsed.body, input.inject ?? [])

  return {
    frontmatter: parsed.data,
    body,
    hadFrontmatter: parsed.hadFrontmatter,
    parseError: parsed.parseError,
    filePath: input.source.filePath,
  }
}

/**
 * Pick the locale-specific content when available, falling back to the base
 * (English) content. This is the single seam where locale selection happens
 * for bundled prompts; filesystem prompts resolve locale via filename.
 */
function selectBundledContent(
  source: import("./types").BundledPromptSource,
  locale: string | undefined,
): string {
  if (locale !== undefined && source.contentByLocale !== undefined) {
    const localized = source.contentByLocale[locale]
    if (localized !== undefined) return localized
  }
  return source.content
}

function resolvePromptFilePath(baseDir: string, promptName: string, variant: string, locale?: string): string {
  const resolvedBaseDir = resolve(baseDir)
  // When a locale is requested, prefer <variant>.<locale>.md and fall back to
  // the base <variant>.md so missing translations degrade gracefully.
  const candidates = locale !== undefined
    ? [`${variant}.${locale}.md`, `${variant}.md`]
    : [`${variant}.md`]
  for (const candidate of candidates) {
    const filePath = resolve(resolvedBaseDir, promptName, candidate)
    const relativePath = relative(resolvedBaseDir, filePath)
    if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
      throw new PromptPathTraversalError(promptName, variant)
    }
    if (existsSync(filePath)) return filePath
  }
  // No candidate existed; return the base path so the caller's readPromptFile
  // raises the usual PromptFileNotFoundError.
  return resolve(resolvedBaseDir, promptName, `${variant}.md`)
}

async function readPromptFile(promptName: string, variant: string, filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8")
  } catch (error) {
    if (error instanceof Error && getErrorCode(error) === "ENOENT") {
      throw new PromptFileNotFoundError(promptName, variant, filePath, { cause: error })
    }
    throw error
  }
}

async function applyRuntimeInjections(
  body: string,
  injections: readonly RuntimeInjection[]
): Promise<string> {
  let renderedBody = body
  for (const injection of injections) {
    renderedBody = renderedBody.replaceAll(injection.placeholder, await injection.resolver())
  }
  return renderedBody
}

function applyRuntimeInjectionsSync(
  body: string,
  injections: readonly SyncRuntimeInjection[]
): string {
  let renderedBody = body
  for (const injection of injections) {
    renderedBody = renderedBody.replaceAll(injection.placeholder, injection.resolver())
  }
  return renderedBody
}

function getErrorCode(error: Error): string | undefined {
  if (!("code" in error)) return undefined
  return typeof error.code === "string" ? error.code : undefined
}
