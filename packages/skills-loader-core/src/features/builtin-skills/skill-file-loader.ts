import { readFileSync } from "node:fs"
import { join } from "node:path"
import { sharedSkillsRootPath } from "@oh-my-opencode/shared-skills"
import { parseFrontmatter } from "@oh-my-opencode/utils"

type SkillFileReader = (path: string, encoding: "utf8") => string

function getReadErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error) {
    return typeof error.code === "string" ? error.code : undefined
  }
  return undefined
}

/**
 * Candidate filenames for a localized skill template. When `locale` is set we
 * prefer `SKILL.<locale>.md` and gracefully fall back to the English `SKILL.md`.
 * This mirrors prompts-core's filesystem locale resolution
 * (`<variant>.<locale>.md` -> `<variant>.md`).
 */
function skillTemplateFilenames(locale: string | undefined): readonly string[] {
  if (locale !== undefined) return [`SKILL.${locale}.md`, "SKILL.md"]
  return ["SKILL.md"]
}

export function createSharedSkillTemplateLoader(
	readFile: SkillFileReader = readFileSync,
	skillsRootPath: string = sharedSkillsRootPath(),
): (skillName: string, locale?: string) => string {
	const cache = new Map<string, string>()
	return (skillName, locale) => {
		const cacheKey = `${skillName}:${locale ?? "en"}`
		const cached = cache.get(cacheKey)
		if (cached !== undefined) return cached
		const skillDir = join(skillsRootPath, skillName)
		const candidates = skillTemplateFilenames(locale).map((name) => join(skillDir, name))
		let lastError: unknown
		for (const candidate of candidates) {
			try {
				const { body } = parseFrontmatter(readFile(candidate, "utf8"))
				cache.set(cacheKey, body)
				return body
			} catch (error) {
				// ENOENT means this candidate doesn't exist; try the next fallback.
				// Any other error (e.g. frontmatter parse) is re-thrown.
				if (getReadErrorCode(error) === "ENOENT") {
					lastError = error
					continue
				}
				throw error
			}
		}
		// No candidate existed; re-raise the last ENOENT so callers see the usual
		// "file not found" error for the base SKILL.md path.
		throw lastError ?? new Error(`Skill file not found: ${skillName}`)
	}
}
const loadSharedSkillTemplateFromDisk = createSharedSkillTemplateLoader()
export function loadSharedSkillTemplate(skillName: string, locale?: string): string {
	return loadSharedSkillTemplateFromDisk(skillName, locale)
}
