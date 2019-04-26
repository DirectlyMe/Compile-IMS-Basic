import * as nodeSsh from "node-ssh";
import * as vscode from "vscode";

const sshSession = new nodeSsh();

// retrieves the connection information from ssh-fs's config
export function getConnectionConfig(
    connectionName: string
): IConnection | undefined {
    try {
        const configuration = vscode.workspace.getConfiguration();

        const connections: IConnection[] | undefined = configuration.get(
            "sshfs.configs"
        );

        if (connections) {
            const connection = connections.find(
                connection => connection.name.toLowerCase() === connectionName
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

export async function establishConnection(
    connection: IConnection
): Promise<ISession | undefined> {
    try {
        // check whether we're connecting with a private key or a password
        let session;
        if (connection.privateKeyPath) {
            session = await sshSession.connect({
                host: connection.host,
                username: connection.username,
                privateKey: connection.privateKeyPath,
                port: connection.port ? connection.port : 22
            });
        } else {
            session = await sshSession.connect({
                host: connection.host,
                username: connection.username,
                password: connection.password,
                port: connection.port ? connection.port : 22
            });
        }

        return session;
    } catch (error) {
        console.error(error);
    }
}
