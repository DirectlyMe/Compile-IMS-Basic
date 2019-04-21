import * as vscode from "vscode";
import * as nodeSsh from "node-ssh";

const sshSession = new nodeSsh();

// #region commands

export async function compileFile(uri: vscode.Uri) {
    // needs all three in order to proceed
    if (!uri.authority || uri.scheme !== "ssh" || !uri.fsPath) return;

    try {
        const connection = getConnection(uri.authority);

        if (!connection) return;

        // check whether we're connecting with a private key or password
        let session;
        if (connection.privateKeyPath) {
            session = await sshSession.connect({
                host: connection.host,
                username: connection.username,
                privateKey: connection.privateKeyPath
            });
        } else {
            session = await sshSession.connect({
                host: connection.host,
                username: connection.username,
                password: connection.password
            });
        }

        // get just the file name
        const file = uri.path.substring(
            uri.path.lastIndexOf("/") + 1,
            uri.path.length
        );

        // check if we're already in /u/sting/src/3
        if (uri.path !== `/u/sting/src/3/${file}`) {
            const filePath =
                "/" + file === uri.path // check if the file is in the root directory
                    ? "." + uri.path
                    : uri.path;

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

// #endregion

// #region private functions

// retrieves the connection information from ssh-fs's config
function getConnection(connectionName: string): IConnection | undefined {
    try {
        const configuration = vscode.workspace.getConfiguration();
        const connections: IConnection[] | undefined = configuration.get(
            "sshfs.configs"
        );

        if (connections) {
            const connection = connections.find(
                connection => connection.name === connectionName
            );

            if (connection) {
                return connection;
            } else {
                return undefined;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// #endregion
