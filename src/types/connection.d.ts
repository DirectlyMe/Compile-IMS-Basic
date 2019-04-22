type IConnection = {
    host: string;
    name: string;
    username: string;
    passphrase?: string;
    privateKeyPath?: string;
    password?: string;
    port?: string;
    root?: string;
}

interface ISession {
    connect: () => any;
    execCommand: (command: string, options: {}) => any;
}
