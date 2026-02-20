# Conductor Orchestrator Superpowers — VS Code Extension

<p align="center">
  <a href="https://github.com/mhmd1983/conductor-orchestrator-superpowers/raw/main/vscode-extension/conductor-orchestrator-superpowers-3.3.0.vsix">
    <img src="https://img.shields.io/badge/Download-VSIX_3.3.0-007ACC?style=for-the-badge&logo=visual-studio-code" alt="Download VSIX"/>
  </a>
</p>

### Install in one command

```bash
# 1. Download the VSIX
curl -L -o conductor.vsix \
  https://github.com/mhmd1983/conductor-orchestrator-superpowers/raw/main/vscode-extension/conductor-orchestrator-superpowers-3.3.0.vsix

# 2. Install into VS Code
code --install-extension conductor.vsix
```

Or click the badge above to download the `.vsix`, then in VS Code:
`Extensions panel → ⋯ menu → Install from VSIX…`

---

A VS Code extension that integrates the **Conductor Orchestrator** multi-agent workflow with **GitHub Copilot Chat**.

## Features

### `@conductor` Copilot Chat Participant

Interact with Conductor directly from the Copilot Chat panel:

| Command | Description |
|---------|-------------|
| `@conductor /init` | Initialize Conductor workflow in the current project |
| `@conductor /go <goal>` | Start a new track — get a structured plan for your goal |
| `@conductor /status` | View the track registry (`conductor/tracks.md`) |
| `@conductor /plan <goal>` | Generate an implementation plan template |
| `@conductor /review` | Run a quality-gate evaluation checklist |

### Command Palette

| Command | Description |
|---------|-------------|
| `Conductor: Initialize Project` | Same as `@conductor /init` — creates the `conductor/` directory |
| `Conductor: Show Status` | Opens `conductor/tracks.md` in Markdown preview |

## What `/init` Creates

Running `@conductor /init` (or `Conductor: Initialize Project` from the command palette) creates the following files in your workspace:

```
your-project/
├── .github/
│   └── copilot-instructions.md   ← teaches Copilot about the workflow
└── conductor/
    ├── tracks.md                 ← track registry
    ├── decision-log.md           ← architectural decision log
    ├── workflow.md               ← Evaluate-Loop documentation
    ├── authority-matrix.md       ← decision authority levels
    ├── tracks/                   ← per-track directories (created on demand)
    └── knowledge/
        └── patterns.md           ← learned patterns and conventions
```

Existing files are **never overwritten**.

## Quick Start

1. Open a project folder in VS Code.
2. Open GitHub Copilot Chat (`Ctrl+Shift+I` / `Cmd+Shift+I`).
3. Type `@conductor /init` and press Enter.
4. Start working: `@conductor /go Add user authentication with OAuth`.

## Requirements

**No Claude CLI required.** The VS Code extension is fully standalone — it uses only the VS Code API and GitHub Copilot. It does not call `claude`, does not read Claude Code config files, and does not need Claude Code installed.

- VS Code 1.95 or later
- GitHub Copilot extension

## Development

```bash
cd vscode-extension
npm install
npm run compile    # compile TypeScript
npm run watch      # watch mode (recompiles on save)
npm run package    # produces conductor-orchestrator-superpowers-3.3.0.vsix
```

To test locally, press **F5** in VS Code to launch the Extension Development Host.

To install your freshly-built VSIX:

```bash
code --install-extension conductor-orchestrator-superpowers-3.3.0.vsix
```

## License

MIT — see [LICENSE](../LICENSE)
