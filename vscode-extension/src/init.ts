import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/** Content written to conductor/tracks.md on first init */
const TRACKS_MD = `# Track Registry

## Active Tracks

| Track ID | Name | Status | Priority | Started |
|----------|------|--------|----------|---------|
| — | — | — | — | — |

## Completed Tracks

| Track ID | Name | Completed | Summary |
|----------|------|-----------|---------|
| — | — | — | — |

---

*Updated by Conductor orchestrator. Do not edit manually.*
`;

/** Content written to conductor/decision-log.md on first init */
const DECISION_LOG_MD = `# Decision Log

All product, pricing, architecture, and model decisions are logged here for audit trail and business document synchronization.

## Decisions

| Date | Track | Decision | Category | Impact | Logged By |
|------|-------|----------|----------|--------|-----------|
| — | — | — | — | — | — |

---

*Entries added automatically by business-docs-sync and lead consultations.*
`;

/** Content written to conductor/knowledge/patterns.md on first init */
const PATTERNS_MD = `# Project Knowledge — Patterns & Conventions

This file captures learned patterns, conventions, and best practices discovered during development.

## Architecture Patterns

*No patterns recorded yet.*

## Code Conventions

*No conventions recorded yet.*

## Common Pitfalls

*No pitfalls recorded yet.*

---

*Updated automatically by Conductor knowledge agents.*
`;

/** Content written to .github/copilot-instructions.md on first init */
const COPILOT_INSTRUCTIONS_MD = `# Conductor Orchestrator — Copilot Instructions

This project uses the **Conductor Orchestrator** workflow for structured, multi-agent development.

## Core Workflow (Evaluate-Loop)

Every feature follows: **Plan → Evaluate Plan → Execute → Evaluate Execution → Fix/Complete**

## Track Structure

All work is organised into tracks under \`conductor/tracks/\`:
- \`spec.md\` — requirements
- \`plan.md\` — implementation plan with dependency graph
- \`metadata.json\` — state machine and configuration

## Key Files

| File | Purpose |
|------|---------|
| \`conductor/tracks.md\` | Registry of all active and completed tracks |
| \`conductor/decision-log.md\` | Audit trail for architectural and product decisions |
| \`conductor/knowledge/patterns.md\` | Learned patterns and best practices |
| \`conductor/workflow.md\` | Full workflow documentation |
| \`conductor/authority-matrix.md\` | Decision authority levels |

## Guidance for Copilot

- Always check \`conductor/tracks.md\` before starting work to see what is already in progress.
- Update \`plan.md\` after completing any task or phase.
- Never mark a track complete without running the evaluation step.
- After code changes that affect product/pricing/model decisions, log them in \`conductor/decision-log.md\`.
- Run the project test suite after every code change and fix any failures before proceeding.

## Agent Roles

| Agent | Responsibility |
|-------|---------------|
| conductor-orchestrator | Master loop coordinator |
| loop-planner | Generates implementation plans with DAG |
| loop-executor | Executes tasks in parallel |
| loop-plan-evaluator | Validates plans before execution |
| loop-execution-evaluator | Checks execution quality |
| loop-fixer | Addresses evaluation failures |
| task-worker | Individual implementation tasks |
| parallel-dispatcher | DAG-based parallel dispatch |
| board-meeting | Strategic board deliberation (5 directors) |
| code-reviewer | Code quality review |
`;

/** Content written to conductor/workflow.md when no plugin workflow.md is found */
const WORKFLOW_MD = `# Development Workflow — Conductor

## MANDATORY RULES

1. **ALWAYS update \`plan.md\`** — After completing ANY task, phase, or sub-task, update the track's \`plan.md\`.
2. **ALWAYS follow the Evaluate-Loop** — Every track uses Plan → Evaluate → Execute → Evaluate → Fix.
3. **NEVER mark a track complete** without running the Evaluate step and confirming all criteria pass.
4. **ALWAYS run tests after code changes** — Fix failing tests before proceeding.

## Evaluate-Loop

\`\`\`
1. PLAN ──► 2. EVALUATE PLAN ──► 3. EXECUTE
                                       │
                                  4. EVALUATE EXECUTION
                                       │
                            ┌──────────┴──────────┐
                            │                     │
                         PASS ✅             FAIL ❌
                            │                     │
                            ▼                     ▼
                      5. COMPLETE           6. FIX PLAN
                                                  │
                                           (loop back to 3)
\`\`\`

## Track Directory

Each track lives in \`conductor/tracks/<track-id>/\`:

- \`spec.md\` — requirements and acceptance criteria
- \`plan.md\` — implementation plan with dependency graph (DAG)
- \`metadata.json\` — state machine, status, configuration

## Starting a Track

1. Create \`conductor/tracks/<id>/spec.md\` with requirements.
2. Create \`conductor/tracks/<id>/plan.md\` with implementation steps.
3. Add the track to \`conductor/tracks.md\`.
4. Execute using the Evaluate-Loop.
`;

/** Content written to conductor/authority-matrix.md when no plugin file is found */
const AUTHORITY_MATRIX_MD = `# Authority Matrix

## Authority Levels

| Level | Description |
|-------|-------------|
| **USER_ONLY** | High-impact decisions requiring explicit user approval |
| **LEAD_CONSULT** | Decisions within lead's domain expertise |
| **ORCHESTRATOR** | Routine decisions following established conventions |

## Always Escalate to User

- Budget changes >$50/month
- Adding or removing features from spec
- Breaking API changes
- Dependencies >50KB gzipped
- Coverage below minimum threshold
- Security or production-data changes

## Lead Can Decide

- Architecture: Patterns (existing), component organisation, additive schema changes
- Product: Spec interpretation, copy, task order within a phase
- Tech: Dependencies <50KB, implementation approach, type definitions
- QA: Coverage thresholds, test types, mock strategy

## Orchestrator Decides Autonomously

- File and variable naming
- devDependencies
- Task markers
- Following established conventions
`;

/**
 * Writes a file only if it does not already exist.
 * Returns true when created, false when skipped.
 */
function writeIfAbsent(filePath: string, content: string): boolean {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

/** Result reported back to the caller. */
export interface InitResult {
  created: string[];
  skipped: string[];
}

/**
 * Initialises the Conductor workflow inside `projectDir`.
 *
 * Creates the `conductor/` directory structure and a
 * `.github/copilot-instructions.md` file that teaches Copilot about the
 * workflow.  Files that already exist are left untouched.
 */
export function initConductor(projectDir: string): InitResult {
  const created: string[] = [];
  const skipped: string[] = [];

  const track = (filePath: string, content: string) => {
    const rel = path.relative(projectDir, filePath);
    if (writeIfAbsent(filePath, content)) {
      created.push(rel);
    } else {
      skipped.push(rel);
    }
  };

  // conductor/ skeleton
  track(path.join(projectDir, 'conductor', 'tracks.md'), TRACKS_MD);
  track(path.join(projectDir, 'conductor', 'decision-log.md'), DECISION_LOG_MD);
  track(path.join(projectDir, 'conductor', 'knowledge', 'patterns.md'), PATTERNS_MD);
  track(path.join(projectDir, 'conductor', 'workflow.md'), WORKFLOW_MD);
  track(path.join(projectDir, 'conductor', 'authority-matrix.md'), AUTHORITY_MATRIX_MD);

  // Copilot instructions for the project
  track(
    path.join(projectDir, '.github', 'copilot-instructions.md'),
    COPILOT_INSTRUCTIONS_MD
  );

  // Ensure the tracks sub-directory exists (no content file needed)
  fs.mkdirSync(path.join(projectDir, 'conductor', 'tracks'), { recursive: true });

  return { created, skipped };
}

/**
 * Resolves the root folder of the first VS Code workspace, or undefined when
 * no workspace is open.
 */
export function getWorkspaceRoot(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  return folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
}
