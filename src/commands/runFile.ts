import * as vscode from "vscode";
import * as shell from "shelljs";
import { openSync, appendFileSync, closeSync } from "fs";
import { getConnectionConfig } from "../util/connectionUtils";
import { getFilePathing } from "../util/fileUtils";

export async function runFile(uri: vscode.Uri): Promise<boolean> {
  try {
    // Get ssh connection information
    const connection = getConnectionConfig(uri.authority);
    if (!connection) {
      vscode.window.showErrorMessage(
        `Error loading connection for ${uri.authority}.`
      );
      return false;
    }

    // Load file path information
    const filePathInformation = getFilePathing(connection, uri.path);
    if (filePathInformation.file === "") {
      vscode.window.showErrorMessage(
        `Error getting file information for path: ${uri.path}`
      );
      return false;
    }

    // Build file of commands
    const commandFile = openSync(
      `${process.env.APPDATA}\\puttycommands.txt`,
      "w"
    );
    appendFileSync(commandFile, ". /etc/setdakcsenv" + "\n");
    appendFileSync(commandFile, `cd ${filePathInformation.workDir}` + "\n");
    appendFileSync(commandFile, `RUN ${filePathInformation.file}` + "\n");
    appendFileSync(commandFile, "/bin/bash");
    closeSync(commandFile);

    // Build putty command string
    let puttyString = "putty.exe ";
    if (connection.port) puttyString += `-P ${connection.port}`;
    puttyString += `${connection.username}@${connection.host} `;
    if (connection.privateKeyPath)
      puttyString += `-i "${connection.privateKeyPath}" `;
    else puttyString += `-pw ${connection.password} `;
    puttyString += `-m "${process.env.APPDATA}\\puttycommands.txt" `;
    puttyString += "-t";

    vscode.window.showInformationMessage(
      `Running ${filePathInformation.file} in a new putty window`
    );

    shell.exec(puttyString, code => {
      if (code !== 0)
        vscode.window.showErrorMessage("Error launching: " + puttyString);
    });

    return true;

    // TODO ADD INTEGRATED TERMINAL WITH INPUT
  } catch (error) {
    console.error(error);
    return false;
  }
}
