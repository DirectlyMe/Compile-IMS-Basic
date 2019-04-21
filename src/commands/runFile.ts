import * as vscode from "vscode";

import {
    getConnectionConfig,
    establishConnection
} from "../util/connectionUtils";

export async function runFile(uri: vscode.Uri) {
    // needs all three in order to proceed
    if (!uri.authority || uri.scheme !== "ssh" || !uri.fsPath) return;

    // get just the file name
    const file = uri.path.substring(
        uri.path.lastIndexOf("/") + 1,
        uri.path.length
    );

    try {
        const connection = getConnectionConfig(uri.authority);
        if (!connection) return;

        const session = await establishConnection(connection);
        if (!session) return;

        session.execCommand(`. /etc/setdakcsenv; RUN 3/${file}`, {
            cwd: "/u/sting",
            onStdout(chunk: Buffer) {
                console.log(chunk.toString("utf8"));
            },
            onStderr(chunk: Buffer) {
                console.log(chunk.toString("utf8"));
            }
        });
    } catch (error) {
        console.error(error);
    }
}
