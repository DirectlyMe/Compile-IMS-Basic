import * as vscode from "vscode";
import * as nodeSsh from "node-ssh";

const sshSession = new nodeSsh();

// #region commands

export async function compileFile(uri: vscode.Uri) {
    if (!uri.authority || uri.scheme !== "ssh") return;
    
    try {
        console.log(uri);
        const connection = getConnection(uri.authority);
    
        if (!connection) return;

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
    
        const { stdout, stderr } = await session.execCommand("ls -ltr", {});
        console.log(`STDOUT: ${stdout}`);
        console.log(`STDERR: ${stderr}`);
    } catch (error) {
        console.error(error);
    }
}

// #endregion

// #region private functions

function getConnection(connectionName: string): IConnection | undefined {
    try {
        const configuration = vscode.workspace.getConfiguration();
        const connections: IConnection[] | undefined = configuration.get("sshfs.configs");

        if (connections) {
            const connection = connections.find(connection => connection.name === connectionName);
            
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
