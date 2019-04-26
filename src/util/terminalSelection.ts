import * as vscode from "vscode";
import { TerminalType } from "../types/enums";

export async function selectTerminal(): Promise<TerminalType> {
    const selection = await vscode.window.showQuickPick(
        ["Putty (Recommended)", "Integrated"],
        {
            placeHolder: "Select your default terminal"
        }
    );

    const configuration = vscode.workspace.getConfiguration();
    if (selection === "Integrated") {
        configuration
            .update(
                "ims.terminal-type",
                TerminalType.integrated,
                vscode.ConfigurationTarget.Global
            );
        return TerminalType.integrated;
    } else {
        configuration
            .update(
                "ims.terminal-type",
                TerminalType.putty,
                vscode.ConfigurationTarget.Global
            );
        return TerminalType.putty;
    }
}

export async function getTerminalType(): Promise<TerminalType> {
    const configuration = vscode.workspace.getConfiguration();
    const type: string | undefined = await configuration.get(
        "ims.terminal-type"
    );

    if (type === "integrated") return TerminalType.integrated;
    else if (type === "putty") return TerminalType.putty;
    else return TerminalType.none;
}
