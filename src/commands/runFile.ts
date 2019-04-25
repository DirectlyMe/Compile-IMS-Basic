import * as vscode from "vscode";
import * as shell from "shelljs";
import { openSync, appendFileSync, closeSync } from "fs";
import { getConnectionConfig } from "../util/connectionUtils";
import { getFilePathing } from "../util/fileUtils";
import { getIntegratedTerminal } from "../util/integratedTerminal";
import { TerminalType } from "../types/enums";
import { getTerminalType, selectTerminal } from "../util/selectTerminal";

export async function runFilePutty(uri: vscode.Uri): Promise<boolean> {
    try {
        // Get ssh connection information
        const connection = getConnectionConfig(uri.authority);
        if (!connection) {
            vscode.window.showErrorMessage(`Error loading connection for ${uri.authority}.`);
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
        const commandFile = openSync(`${process.env.APPDATA}\\puttycommands.txt`, "w");
        appendFileSync(commandFile, ". /etc/setdakcsenv" + "\n");
        appendFileSync(commandFile, `cd ${filePathInformation.workDir}` + "\n");
        appendFileSync(commandFile, `RUN ${filePathInformation.file}` + "\n");
        appendFileSync(commandFile, "/bin/bash");
        closeSync(commandFile);

        // Build putty command string
        let puttyString = "putty.exe ";
        if (connection.port) puttyString += `-p ${connection.port}`;
        puttyString += `${connection.username}@${connection.host} `;
        if (connection.privateKeyPath) puttyString += `-i "${connection.privateKeyPath}" `;
        else puttyString += `-pw ${connection.password} `;
        puttyString += `-m "${process.env.APPDATA}\\puttycommands.txt" `;
        puttyString += "-t";

        shell.exec(puttyString, (code) => {
            if (code !== 0) {
                vscode.window.showErrorMessage(
                    "Error launching putty \n Connection String: " + puttyString
                );
            }
        });

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function runFileIntegrated(
    uri: vscode.Uri,
    terminalID: number
): Promise<boolean> {
    try {
        // Get ssh connection information
        const connection = getConnectionConfig(uri.authority);
        if (!connection) {
            vscode.window.showErrorMessage(`Error loading connection for ${uri.authority}.`);
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

        const terminal = getIntegratedTerminal(connection, terminalID);
        if (!terminal) {
            vscode.window.showErrorMessage(
                `Couldn't launch integrated terminal ${connection}`
            );
            return false;
        }

        terminal.sendText(
            `. /etc/setdakcsenv; cd ${filePathInformation.workDir}; RUN ${
                filePathInformation.file
            }`
        );

        return true;
    } catch (error) {
        vscode.window.showErrorMessage(error);
        return false;
    }
}

export default async function runFile(uri: vscode.Uri): Promise<boolean> {
    let terminalType = await getTerminalType();

    if (terminalType === TerminalType.none) {
        terminalType = await selectTerminal();
    }

    let result;
    if (terminalType === TerminalType.integrated) {
        let NEXT_TERM_ID = 1;
        result = await runFileIntegrated(uri, NEXT_TERM_ID);
    } else if (terminalType === TerminalType.putty) {
        result = await runFilePutty(uri);
    } else {
        vscode.window.showErrorMessage(
            "Make sure a default terminal is selected with the IMS: Choose Terminal command."
        );
        result = false;
    }
    
    return result;
}
