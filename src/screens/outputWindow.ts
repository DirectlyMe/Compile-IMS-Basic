import * as vscode from "vscode";

export const scheme = "output";

export class OutputProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<string> {
        return uri.path;
    }
}

export async function showOutputWindow(output: string) {}
