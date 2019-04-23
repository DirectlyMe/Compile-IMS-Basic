// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { compileFile } from "./commands/compileFile";
import { runFile } from "./commands/runFile";
import { OutputProvider, scheme } from "./screens/outputWindow";
import { openConnection } from "./commands/openConnection";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Register text provider
  const outputScheme = scheme;
  const outputProvider = new OutputProvider();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const outputWindow = vscode.commands;

  const compile = vscode.commands.registerCommand(
    "extension.compile",
    (uri: vscode.Uri) => compileFile(uri)
  );

  const run = vscode.commands.registerCommand(
    "extension.run",
    (uri: vscode.Uri) => runFile(uri)
  );

  const connect = vscode.commands.registerCommand(
    "extension.connect",
    (uri: vscode.Uri) => openConnection(uri)
  );

  const compilerun = vscode.commands.registerCommand(
    "extension.compilerun",
    async (uri: vscode.Uri) => {
      const didcompile = await compileFile(uri);
      if (didcompile) runFile(uri);
    }
  );

  context.subscriptions.push(compile);
  context.subscriptions.push(run);
  context.subscriptions.push(connect);
  context.subscriptions.push(compilerun);
}

// this method is called when your extension is deactivated
export function deactivate() {}
