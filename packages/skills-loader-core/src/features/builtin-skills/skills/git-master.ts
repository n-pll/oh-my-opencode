import type { BuiltinSkill } from "../types"

import {
  GIT_MASTER_SKILL_DESCRIPTION,
  GIT_MASTER_SKILL_DESCRIPTION_ZH,
  GIT_MASTER_SKILL_NAME,
} from "./git-master-skill-metadata"
import { GIT_MASTER_COMMIT_WORKFLOW_SECTION } from "./git-master-sections/commit-workflow"
import { GIT_MASTER_HISTORY_SEARCH_WORKFLOW_SECTION } from "./git-master-sections/history-search-workflow"
import { GIT_MASTER_OVERVIEW_SECTION } from "./git-master-sections/overview"
import { GIT_MASTER_QUICK_REFERENCE_SECTION } from "./git-master-sections/quick-reference"
import { GIT_MASTER_REBASE_WORKFLOW_SECTION } from "./git-master-sections/rebase-workflow"
import { GIT_MASTER_COMMIT_WORKFLOW_SECTION_ZH } from "./git-master-sections/commit-workflow.zh"
import { GIT_MASTER_HISTORY_SEARCH_WORKFLOW_SECTION_ZH } from "./git-master-sections/history-search-workflow.zh"
import { GIT_MASTER_OVERVIEW_SECTION_ZH } from "./git-master-sections/overview.zh"
import { GIT_MASTER_QUICK_REFERENCE_SECTION_ZH } from "./git-master-sections/quick-reference.zh"
import { GIT_MASTER_REBASE_WORKFLOW_SECTION_ZH } from "./git-master-sections/rebase-workflow.zh"

const SEPARATOR = "---"

function joinSections(...sections: string[]): string {
  return sections
    .flatMap((section, index) =>
      index === 0 ? [section] : [SEPARATOR, section],
    )
    .join("\n\n")
}

const GIT_MASTER_TEMPLATE = joinSections(
  GIT_MASTER_OVERVIEW_SECTION,
  GIT_MASTER_COMMIT_WORKFLOW_SECTION,
  `${SEPARATOR}\n${SEPARATOR}`,
  GIT_MASTER_REBASE_WORKFLOW_SECTION,
  `${SEPARATOR}\n${SEPARATOR}`,
  GIT_MASTER_HISTORY_SEARCH_WORKFLOW_SECTION,
  GIT_MASTER_QUICK_REFERENCE_SECTION,
)

const GIT_MASTER_TEMPLATE_ZH = joinSections(
  GIT_MASTER_OVERVIEW_SECTION_ZH,
  GIT_MASTER_COMMIT_WORKFLOW_SECTION_ZH,
  `${SEPARATOR}\n${SEPARATOR}`,
  GIT_MASTER_REBASE_WORKFLOW_SECTION_ZH,
  `${SEPARATOR}\n${SEPARATOR}`,
  GIT_MASTER_HISTORY_SEARCH_WORKFLOW_SECTION_ZH,
  GIT_MASTER_QUICK_REFERENCE_SECTION_ZH,
)

export function createGitMasterSkill(locale?: string): BuiltinSkill {
  return {
    name: GIT_MASTER_SKILL_NAME,
    description: GIT_MASTER_SKILL_DESCRIPTION,
    descriptionByLocale: { zh: GIT_MASTER_SKILL_DESCRIPTION_ZH },
    template: GIT_MASTER_TEMPLATE,
    templateByLocale: { zh: GIT_MASTER_TEMPLATE_ZH },
  }
}

/** Backward-compatible English-default singleton. */
export const gitMasterSkill: BuiltinSkill = createGitMasterSkill()
