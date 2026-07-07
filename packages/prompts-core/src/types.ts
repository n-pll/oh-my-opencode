export type ModelVariant =
  | "default"
  | "gpt"
  | "gemini"
  | "kimi"
  | "glm"
  | "planner"
  | "codex"
  | "opus-4-7"
  | "minimax"

export type FilesystemPromptSource = {
  readonly kind?: "filesystem"
  readonly baseDir: string
}

export type BundledPromptSource = {
  readonly kind: "bundled"
  readonly content: string
  readonly filePath: string
  /**
   * Optional locale-keyed content overrides. When `loadPromptSync`/`loadPrompt`
   * is called with a `locale` that has an entry here, that content is used
   * instead of `content`. Falls back to `content` when the locale is absent.
   * The `filePath` stays the base (English) path for error reporting.
   */
  readonly contentByLocale?: Readonly<Record<string, string>>
}

export type PromptSource = FilesystemPromptSource | BundledPromptSource

export type RuntimeInjection = {
  readonly placeholder: string
  readonly resolver: () => string | Promise<string>
}

export type SyncRuntimeInjection = {
  readonly placeholder: string
  readonly resolver: () => string
}

export type LoadFilesystemPromptInput = {
  readonly source: FilesystemPromptSource
  readonly name: string
  readonly variant: string
  readonly inject?: readonly RuntimeInjection[]
  /**
   * Optional locale. When set, the loader first tries `<name>/<variant>.<locale>.md`
   * and falls back to `<name>/<variant>.md`. Absent = English default.
   */
  readonly locale?: string
}

export type LoadBundledPromptInput = {
  readonly source: BundledPromptSource
  readonly name: string
  readonly variant: string
  readonly inject?: readonly SyncRuntimeInjection[]
  /**
   * Optional locale for content selection. When set, the loader prefers
   * source.contentByLocale[locale] over source.content. Absent = English
   * (backwards-compatible default).
   */
  readonly locale?: string
}

export type LoadPromptInput = LoadFilesystemPromptInput | LoadBundledPromptInput

export type LoadedPrompt<TFrontmatter = Record<string, unknown>> = {
  readonly frontmatter: TFrontmatter
  readonly body: string
  readonly hadFrontmatter: boolean
  readonly parseError: boolean
  readonly filePath: string
}

export type VariantTable = Readonly<Record<string, PromptSource>>
