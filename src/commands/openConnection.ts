import { appendFileSync, closeSync, openSync } from "fs";
import * as shell from "shelljs";
import * as vscode from "vscode";

import { getConnectionConfig } from "../util/connectionUtils";
import { getIntegratedTerminal } from "../util/integratedTerminal";

export async function openConnection(uri: vscode.Uri) {
    try {
        // Get ssh connection information
        const connection = getConnectionConfig(uri.authority);
        if (!connection) {
            vscode.window.showErrorMessage(`Error loading connection for ${uri.authority}.`);
            return;
        }

        // Build file of commands
        const commandFile = openSync(`${process.env.APPDATA}\\puttycommands.txt`, "w");
        appendFileSync(commandFile, ". /etc/setdakcsenv \n");
        connection.root
            ? appendFileSync(commandFile, `cd ${connection.root} \n`)
            : appendFileSync(commandFile, `cd /u/sting \n`);

        appendFileSync(commandFile, "/bin/bash");
        closeSync(commandFile);

        // Build putty command string
        let puttyString = "putty.exe ";
        if (connection.port) puttyString += `-p ${connection.port} `;
        puttyString += `${connection.username}@${connection.host} `;
        if (connection.privateKeyPath) puttyString += `-i "${connection.privateKeyPath}" `;
        else puttyString += `-pw ${connection.password} `;
        puttyString += `-m "${process.env.APPDATA}\\puttycommands.txt" `;
        puttyString += "-t";

        shell.exec(puttyString, (code, stdout, stderr) => {
            if (code !== 0) {
                vscode.window.showErrorMessage(
                    "Error launching putty \n Connection String: " + puttyString
                );
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(error);
    }
}

export function openConnectionInternal(uri: vscode.Uri, terminalId: number) {
    try {
        // Get ssh connection information
        const connection = getConnectionConfig(uri.authority);
        if (!connection) {
            vscode.window.showErrorMessage(`Error loading connection for ${uri.authority}.`);
            return;
        }

        // use _ for unused return variable
        const _ = getIntegratedTerminal(connection, terminalId);
        
    } catch (error) {
        vscode.window.showErrorMessage(error);
    }
}
