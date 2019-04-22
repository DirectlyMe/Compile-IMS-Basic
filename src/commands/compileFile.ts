import * as vscode from "vscode";

import {
  getConnectionConfig,
  establishConnection
} from "../util/connectionUtils";

export async function compileFile(uri: vscode.Uri) {
  // needs all three in order to proceed
  if (!uri.authority || uri.scheme !== "ssh" || !uri.fsPath) return;

  try {
    const connection = getConnectionConfig(uri.authority);
    if (!connection) {
      vscode.window.showErrorMessage(
        `Error loading connection for ${uri.authority}.`
      );
      return;
    }

    const session = await establishConnection(connection);
    if (!session) {
      vscode.window.showErrorMessage(
        `Error establishing connection for ${uri.authority}.`
      );
      return;
    }

    // Check if there is a root directory
    const rootDir = connection.root === undefined ? "" : connection.root;

    // Check for a src folder in the file path selected
    const srcPos = uri.path.lastIndexOf("/src");
    if (srcPos === -1) {
      vscode.window.showErrorMessage(
        "File is not in a src directory and cannot be compiled."
      );
      return;
    }

    // Get the working directory for the compiler
    const workDir = rootDir + uri.path.substring(0, srcPos);

    // Get the file name
    const file = uri.path.substring(srcPos + 5, uri.path.length);

    // bring in environment variables, cd into working directory, compile program
    const { stdout, stderr } = await session.execCommand(
      `. /etc/setdakcsenv; BASIC -C ${file}`,
      { cwd: `${workDir}` }
    );

    if (stderr === "Loading constants")
      vscode.window.showInformationMessage(`${file} Compiled Successfully`);
    else
      vscode.window.showErrorMessage(
        `${file} Compile Failed: \n` +
          stderr.substring(
            stderr.indexOf("Loading constants") + 18,
            stderr.length
          )
      );

    console.log(stdout);
    console.log(stderr);
  } catch (error) {
    console.error(error);
  }
}
