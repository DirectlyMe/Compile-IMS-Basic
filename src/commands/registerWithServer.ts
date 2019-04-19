// import fs from "fs";
// import path from "path";
import * as nodeSsh from 'node-ssh';

import { password } from '../pass';

const sshSession = new nodeSsh();

export async function connectToServer() {
    try {
        const session = await sshSession.connect({
            host: "support.dakcs.com",
            username: "jackh",
            password
        });

        const { stdout, stderr } = await session.execCommand("ls -ltr", {});
        console.log(`STDOUT: ${stdout}`);
        console.log(`STDERR: ${stderr}`);


    } catch (error) {
        console.log(error);
    }
}
