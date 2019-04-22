import * as vscode from "vscode";
import * as shell from "shelljs";
import { openSync, appendFileSync, closeSync } from "fs";
import {
  getConnectionConfig,
  establishConnection
} from "../util/connectionUtils";

export async function runFile(uri: vscode.Uri) {
  try {
    const connection = getConnectionConfig(uri.authority);
    if (!connection) return;

    const session = await establishConnection(connection);
    if (!session) return;

    // Check for a src folder in the file path selected
    const srcPos = uri.path.lastIndexOf("/src");

    let file;
    let workDir;
    let rootDir;

    // Check if there is a root directory
    rootDir = connection.root === undefined ? "" : connection.root;

    // File path
    if (srcPos === -1) {
      const secondLastIndex = uri.path
        .substring(0, uri.path.lastIndexOf("/"))
        .lastIndexOf("/");
      workDir = rootDir + uri.path.substring(0, secondLastIndex);
      file = uri.path.substring(secondLastIndex + 1, uri.path.length);
    } else {
      // Get the working directory for the compiler
      workDir = rootDir + uri.path.substring(0, srcPos);

      // Get the file name
      file = uri.path.substring(srcPos + 5, uri.path.length);
    }

    // Build file of commands
    const commandFile = openSync(
      process.env.APPDATA + "\\puttycommands.txt",
      "w"
    );
    appendFileSync(commandFile, ". /etc/setdakcsenv" + "\n");
    appendFileSync(commandFile, `cd ${workDir}` + "\n");
    appendFileSync(commandFile, `RUN ${file}` + "\n");
    appendFileSync(commandFile, "/bin/bash");
    closeSync(commandFile);

    // Build putty command string
    let puttyString = "putty.exe ";
    if (connection.port) puttyString += `-p ${connection.port}`;
    puttyString += `${connection.username}@${connection.host} `;
    if (connection.privateKeyPath)
      puttyString += `-i "${connection.privateKeyPath}" `;
    else puttyString += `-pw ${connection.password} `;
    puttyString += `-m "${process.env.APPDATA}\\puttycommands.txt" `;
    puttyString += "-t";

    //console.log(puttyString);

    if (shell.exec(puttyString).code !== 0) {
      shell.echo("Error launching putty");
      shell.echo("Connection String: " + puttyString);
    }

    // TODO ADD INTEGRATED TERMINAL WITH INPUT
  } catch (error) {
    console.error(error);
  }
}
