# Conductor Orchestrator Superpowers — VS Code Extension

<p align="center">
  <a href="https://github.com/mhmd1983/conductor-orchestrator-superpowers/releases/latest">
    <img src="https://img.shields.io/github/v/release/mhmd1983/conductor-orchestrator-superpowers?filter=vscode-v*&label=Download%20VSIX&logo=visual-studio-code&color=007ACC&style=for-the-badge" alt="Download latest VSIX"/>
  </a>
</p>

### Install in one command

```bash
# Download the latest VSIX from GitHub Releases and install it
# (replace X.X.X with the version shown on the Releases page)
curl -L -o conductor.vsix \
  https://github.com/mhmd1983/conductor-orchestrator-superpowers/releases/latest/download/conductor-orchestrator-superpowers-3.3.0.vsix \
  && code --install-extension conductor.vsix
```

Or go to the [**Releases page**](https://github.com/mhmd1983/conductor-orchestrator-superpowers/releases/latest),
download the `.vsix` asset, then in VS Code:
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
