import * as vscode from "vscode";

import { getConnectionConfig, establishConnection } from "../util/connectionUtils";


export async function compileFile(uri: vscode.Uri) {
    // needs all three in order to proceed
    if (!uri.authority || uri.scheme !== "ssh" || !uri.fsPath) return;

    // get just the file name
    const file = uri.path.substring(
        uri.path.lastIndexOf("/") + 1,
        uri.path.length
    );

    // check if the file is in the root directory
    const filePath =
    "/" + file === uri.path 
        ? "." + uri.path
        : uri.path;

    try {
        const connection = getConnectionConfig(uri.authority);
        if (!connection) return;

        const session = await establishConnection(connection);
        if (!session) return;


        // check if we're already in /u/sting/src/3
        if (uri.path !== `/u/sting/src/3/${file}`) {
            const { stdout, stderr } = await session.execCommand(
                `cp ${filePath} /u/sting/src/3`,
                {}
            );
            console.log(stdout);
            console.log(stderr);

            // if stderr returned something our file copy failed
            if (stderr !== "") return;
        }

        // bring in environment variables, cd into /u/sting and compile the script
        const { stdout, stderr } = await session.execCommand(
            `. /etc/setdakcsenv; BASIC -C 3/${file}`,
            { cwd: "/u/sting" }
        );
        console.log(stdout);
        console.log(stderr);
    } catch (error) {
        console.error(error);
    }
}
