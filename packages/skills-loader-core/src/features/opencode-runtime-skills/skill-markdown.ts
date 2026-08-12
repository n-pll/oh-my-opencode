import type { BuiltinSkill } from "../builtin-skills/types"
import { selectLocalizedField } from "../builtin-skills/types"

export type OpenCodeSkillMarkdown = {
  readonly name: string
  readonly description: string
  readonly markdown: string
}

export function createOpenCodeSkillMarkdown(skill: BuiltinSkill, locale?: string): OpenCodeSkillMarkdown {
  const body = selectLocalizedField(skill.template, skill.templateByLocale, locale).trimStart()
  const description = selectLocalizedField(skill.description, skill.descriptionByLocale, locale)
  const markdown = [
    "---",
    `name: ${skill.name}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    body,
  ].join("\n")

  return {
    name: skill.name,
    description,
    markdown,
  }
}
