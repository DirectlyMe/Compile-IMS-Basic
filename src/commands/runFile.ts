import * as vscode from "vscode";

import {
    getConnectionConfig,
    establishConnection
} from "../util/connectionUtils";
import { stringify } from "querystring";

export async function runFile(uri: vscode.Uri) {
    try {
        const connection = getConnectionConfig(uri.authority);
        if (!connection) return;

        const session = await establishConnection(connection);
        if (!session) return;

        // Check for a src folder in the file path selected
        const src_pos = uri.path.lastIndexOf("/src");

        let file;
        let work_dir;
        let root_dir;

        // Check if there is a root directory
        root_dir = connection.root === undefined? "": connection.root;

        // File path 
        if (src_pos <= 0)
        {
            const second_last_index = uri.path.substring(0, uri.path.lastIndexOf("/")).lastIndexOf("/");
            work_dir = root_dir + uri.path.substring(
                0,
                second_last_index
            );
            file = uri.path.substring(second_last_index + 1, uri.path.length);
        }
        else
        {
            // Get the working directory for the compiler
            work_dir = root_dir + uri.path.substring(
                0,
                src_pos
            );

            // Get the file name
            file = uri.path.substring(
                src_pos + 5,
                uri.path.length
            );
        }

        session.execCommand(`. /etc/setdakcsenv; RUN ${file}`, {
            cwd: `${work_dir}`,
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
