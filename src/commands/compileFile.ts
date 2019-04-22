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
    if (!connection) return;

    const session = await establishConnection(connection);
    if (!session) return;

    // Check if there is a root directory
    const rootDir = connection.root === undefined ? "" : connection.root;

    // Check for a src folder in the file path selected
    const srcPos = uri.path.lastIndexOf("/src");
    if (srcPos <= 0) {
      console.log("File not in a src directory.");
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
    console.log(stdout);
    console.log(stderr);
  } catch (error) {
    console.error(error);
  }
}
