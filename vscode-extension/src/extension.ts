import * as vscode from 'vscode';
import { initConductor, getWorkspaceRoot } from './init';
import { registerParticipant } from './participant';

export function activate(context: vscode.ExtensionContext): void {
  // Register the @conductor Copilot Chat participant
  registerParticipant(context);

  // Register the "Conductor: Initialize Project" command (command palette)
  context.subscriptions.push(
    vscode.commands.registerCommand('conductor.init', async () => {
      const projectDir = getWorkspaceRoot();
      if (!projectDir) {
        vscode.window.showErrorMessage(
          'Conductor: No workspace folder is open. Please open a project folder first.'
        );
        return;
      }

      const result = initConductor(projectDir);

      const summary =
        result.created.length > 0
          ? `Created: ${result.created.join(', ')}`
          : 'All Conductor files already exist — nothing to create.';

      vscode.window.showInformationMessage(`Conductor initialized. ${summary}`);

      // Open tracks.md so the user can see the registry immediately
      const tracksUri = vscode.Uri.joinPath(
        vscode.Uri.file(projectDir),
        'conductor',
        'tracks.md'
      );
      await vscode.commands.executeCommand('markdown.showPreview', tracksUri);
    })
  );

  // Register the "Conductor: Show Status" command (command palette)
  context.subscriptions.push(
    vscode.commands.registerCommand('conductor.status', async () => {
      const projectDir = getWorkspaceRoot();
      if (!projectDir) {
        vscode.window.showErrorMessage(
          'Conductor: No workspace folder is open.'
        );
        return;
      }

      const tracksUri = vscode.Uri.joinPath(
        vscode.Uri.file(projectDir),
        'conductor',
        'tracks.md'
      );
      await vscode.commands.executeCommand('markdown.showPreview', tracksUri);
    })
  );
}

export function deactivate(): void {
  // Nothing to clean up — VS Code disposes subscriptions automatically.
}
