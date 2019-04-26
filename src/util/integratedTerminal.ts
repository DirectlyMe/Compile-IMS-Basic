import * as vscode from "vscode";

export function getIntegratedTerminal(connection: IConnection, terminalId: number): vscode.Terminal | undefined {
    let terminal;
    if (connection.privateKeyPath) {
        //connection.privateKeyPath = connection.privateKeyPath.replace(/\\/g, "/");
        terminal = vscode.window.createTerminal(`Ext Terminal #${terminalId}`);
        terminal.show();
        terminal.sendText(
            `ssh -oIdentityFile='${connection.privateKeyPath}' ${connection.username}@${
                connection.host
            }`
        );
    } else if (!connection.privateKeyPath && connection.password) {
        terminal = vscode.window.createTerminal(`Ext Terminal #${terminalId}`);
        terminal.show();
        terminal.sendText(`ssh ${connection.username}@${connection.host}`);
        terminal.sendText(connection.password);
    } else {
        terminal = vscode.window.createTerminal(`Ext Terminal #${terminalId}`);
        terminal.show();
        terminal.sendText(`ssh ${connection.username}@${connection.host}`);
    }

    return terminal;
}
