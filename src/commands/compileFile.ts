import * as vscode from "vscode";
import { getFilePathing } from "../util/fileUtils";
import {
    getConnectionConfig,
    establishConnection
} from "../util/connectionUtils";

export async function compileFile(uri: vscode.Uri): Promise<boolean> {
    // needs all three in order to proceed
    if (!uri.authority || uri.scheme !== "ssh" || !uri.fsPath) return false;

    try {
        // Get ssh connection information
        const connection = getConnectionConfig(uri.authority);
        if (!connection) {
            vscode.window.showErrorMessage(
                `Error loading connection for ${uri.authority}.`
            );
            return false;
        }

        // Establish ssh connection
        const session = await establishConnection(connection);
        if (!session) {
            vscode.window.showErrorMessage(
                `Error establishing connection for ${uri.authority}.`
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

        // Bring in environment variables, cd into working directory, compile program
        const { stdout, stderr } = await session.execCommand(
            `. /etc/setdakcsenv; BASIC -C ${filePathInformation.file}`,
            { cwd: `${filePathInformation.workDir}` }
        );

        // Check if the file compiled correctly
        var arrStdErr = stderr.split("\n");
        let compileError = false;

        for (let i of arrStdErr) {
            if (
                !i.startsWith("Loading constants") &&
                !i.startsWith("Including")
            ) {
                compileError = true;
            }
        }
        if (!compileError)
            vscode.window.showInformationMessage(
                `${filePathInformation.file} Compiled Successfully`
            );
        else {
            vscode.window.showErrorMessage(
                `${filePathInformation.file} Compile Failed: \n` +
                    stderr.substring(
                        stderr.indexOf("Loading constants") + 18,
                        stderr.length
                    )
            );
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}
