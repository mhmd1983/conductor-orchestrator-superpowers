import * as vscode from 'vscode';
import { initConductor, getWorkspaceRoot } from './init';

const PARTICIPANT_ID = 'conductor.orchestrator';

/** Maps every supported slash command to a short help string. */
const COMMAND_HELP: Record<string, string> = {
  init: 'Initialize Conductor workflow in the current project.',
  go: 'Start a new track — state your goal and Conductor creates a spec and plan.',
  status: 'Show the contents of `conductor/tracks.md`.',
  plan: 'Create an implementation plan for a goal.',
  review: 'Run a quality-gate evaluation checklist on the current track.',
};

/** Handles `@conductor /init` */
async function handleInit(
  stream: vscode.ChatResponseStream,
  projectDir: string
): Promise<void> {
  stream.markdown('Initializing Conductor in `' + projectDir + '` …\n\n');
  const result = initConductor(projectDir);

  if (result.created.length > 0) {
    stream.markdown('**Created:**\n');
    for (const f of result.created) {
      stream.markdown(`- \`${f}\`\n`);
    }
    stream.markdown('\n');
  }

  if (result.skipped.length > 0) {
    stream.markdown('**Already existed (skipped):**\n');
    for (const f of result.skipped) {
      stream.markdown(`- \`${f}\`\n`);
    }
    stream.markdown('\n');
  }

  stream.markdown(
    '✅ **Conductor initialized!**\n\n' +
    'Next steps:\n' +
    '- Use `@conductor /go <your goal>` to start a new track\n' +
    '- Use `@conductor /status` to view the track registry\n' +
    '- See `conductor/workflow.md` for the full Evaluate-Loop documentation\n'
  );
}

/** Handles `@conductor /status` */
async function handleStatus(
  stream: vscode.ChatResponseStream,
  projectDir: string
): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  const tracksFile = path.join(projectDir, 'conductor', 'tracks.md');

  if (!fs.existsSync(tracksFile)) {
    stream.markdown(
      '⚠️ No `conductor/tracks.md` found.\n\n' +
      'Run `@conductor /init` to initialize Conductor in this project.'
    );
    return;
  }

  const content = fs.readFileSync(tracksFile, 'utf8');
  stream.markdown('**Track Registry** (`conductor/tracks.md`):\n\n');
  stream.markdown(content);
}

/** Handles `@conductor /go <goal>` */
function handleGo(
  stream: vscode.ChatResponseStream,
  goal: string,
  projectDir: string
): void {
  if (!goal.trim()) {
    stream.markdown('Please provide a goal, e.g. `@conductor /go Add user authentication with OAuth`');
    return;
  }

  const trackId = goal
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  stream.markdown(
    `## Track: ${goal}\n\n` +
    `**Track ID:** \`${trackId}\`\n\n` +
    `**Project:** \`${projectDir}\`\n\n` +
    '### Suggested Next Steps (Evaluate-Loop)\n\n' +
    '1. **Create spec** — Add `conductor/tracks/' + trackId + '/spec.md` with requirements and acceptance criteria.\n' +
    '2. **Create plan** — Add `conductor/tracks/' + trackId + '/plan.md` with implementation steps and dependency graph.\n' +
    '3. **Register track** — Add an entry to `conductor/tracks.md`.\n' +
    '4. **Execute** — Work through the plan, updating `plan.md` after each completed step.\n' +
    '5. **Evaluate** — Run `@conductor /review` after execution.\n' +
    '6. **Fix / Complete** — Address any evaluation failures, then mark the track complete.\n\n' +
    '> Tip: Create `conductor/tracks/' + trackId + '/spec.md` now and describe what you need built.\n'
  );
}

/** Handles `@conductor /plan <goal>` */
function handlePlan(
  stream: vscode.ChatResponseStream,
  goal: string
): void {
  if (!goal.trim()) {
    stream.markdown('Please provide a goal, e.g. `@conductor /plan Add Stripe payment integration`');
    return;
  }

  stream.markdown(
    `## Implementation Plan: ${goal}\n\n` +
    'Use the following template for `plan.md`:\n\n' +
    '```markdown\n' +
    `# Plan: ${goal}\n\n` +
    '## Status\n\n' +
    'Phase: Planning | Execute cycle: 0 / 3\n\n' +
    '## Phases\n\n' +
    '### Phase 1: Setup & Foundation\n\n' +
    '- [ ] Task 1.1 — description\n' +
    '- [ ] Task 1.2 — description\n\n' +
    '### Phase 2: Core Implementation\n\n' +
    '- [ ] Task 2.1 — description (depends on: 1.1)\n' +
    '- [ ] Task 2.2 — description (depends on: 1.1)\n\n' +
    '### Phase 3: Testing & Validation\n\n' +
    '- [ ] Task 3.1 — Write tests (depends on: 2.1, 2.2)\n' +
    '- [ ] Task 3.2 — Fix any failures (depends on: 3.1)\n\n' +
    '## Dependency Graph (DAG)\n\n' +
    '```\n' +
    '1.1 ──► 2.1 ──► 3.1\n' +
    '     \\► 2.2 ──/\n' +
    '```\n' +
    '```\n\n' +
    '> Tasks without dependencies can run in parallel.\n'
  );
}

/** Handles `@conductor /review` */
function handleReview(stream: vscode.ChatResponseStream): void {
  stream.markdown(
    '## Quality-Gate Evaluation Checklist\n\n' +
    '### Code Quality\n\n' +
    '- [ ] All tests pass\n' +
    '- [ ] No linting errors\n' +
    '- [ ] No TypeScript / build errors\n' +
    '- [ ] Code follows existing conventions\n\n' +
    '### Integration\n\n' +
    '- [ ] Feature integrates cleanly with existing code\n' +
    '- [ ] No regressions in related features\n' +
    '- [ ] API contracts respected\n\n' +
    '### Business Logic\n\n' +
    '- [ ] Acceptance criteria from `spec.md` are met\n' +
    '- [ ] Edge cases handled\n' +
    '- [ ] Error states handled gracefully\n\n' +
    '### UI/UX (if applicable)\n\n' +
    '- [ ] Accessible (ARIA, keyboard navigation)\n' +
    '- [ ] Responsive on all target screen sizes\n' +
    '- [ ] Consistent with design system\n\n' +
    '### Completion\n\n' +
    '- [ ] `plan.md` updated to reflect completed tasks\n' +
    '- [ ] Architectural decisions logged in `conductor/decision-log.md`\n' +
    '- [ ] Track entry updated in `conductor/tracks.md`\n'
  );
}

/** Shows a help message listing all available commands. */
function handleHelp(stream: vscode.ChatResponseStream): void {
  stream.markdown('## Conductor Orchestrator\n\n');
  stream.markdown('Multi-agent orchestration for structured software development.\n\n');
  stream.markdown('### Available Commands\n\n');
  for (const [cmd, desc] of Object.entries(COMMAND_HELP)) {
    stream.markdown(`- \`/${cmd}\` — ${desc}\n`);
  }
  stream.markdown(
    '\n### Quick Start\n\n' +
    '1. `@conductor /init` — set up Conductor in the current project\n' +
    '2. `@conductor /go Add user authentication` — start a new track\n' +
    '3. `@conductor /status` — see all tracks\n'
  );
}

/**
 * Registers the `@conductor` Copilot Chat participant and wires up all
 * slash commands.
 */
export function registerParticipant(
  context: vscode.ExtensionContext
): vscode.Disposable {
  const participant = vscode.chat.createChatParticipant(
    PARTICIPANT_ID,
    async (
      request: vscode.ChatRequest,
      _context: vscode.ChatContext,
      stream: vscode.ChatResponseStream,
      _token: vscode.CancellationToken
    ) => {
      const projectDir = getWorkspaceRoot();

      if (!projectDir) {
        stream.markdown(
          '⚠️ No workspace folder is open. Please open a project folder first.'
        );
        return;
      }

      const cmd = request.command;
      const prompt = request.prompt.trim();

      switch (cmd) {
        case 'init':
          await handleInit(stream, projectDir);
          break;
        case 'status':
          await handleStatus(stream, projectDir);
          break;
        case 'go':
          handleGo(stream, prompt, projectDir);
          break;
        case 'plan':
          handlePlan(stream, prompt);
          break;
        case 'review':
          handleReview(stream);
          break;
        default:
          handleHelp(stream);
          break;
      }
    }
  );

  participant.iconPath = new vscode.ThemeIcon('circuit-board');
  context.subscriptions.push(participant);
  return participant;
}
