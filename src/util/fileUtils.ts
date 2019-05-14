export function getFilePathing(
    connection: IConnection,
    pathname: string
): IPathInformation {
    let pathInformation: IPathInformation = {
        file: "",
        workDir: "",
        rootDir: ""
    };

    const fullpathname = connection.root + pathname;
    // Check for a src folder in the file path selected
    const srcPos = fullpathname.lastIndexOf("/src/");

    // Check if there is a root directory
    pathInformation.rootDir =
        connection.root === undefined ? "" : connection.root;

    // File path
    if (srcPos === -1) {
        const secondLastIndex = pathname
            .substring(0, pathname.lastIndexOf("/"))
            .lastIndexOf("/");
        pathInformation.workDir =
            pathInformation.rootDir + pathname.substring(0, secondLastIndex);
        pathInformation.file = pathname.substring(
            secondLastIndex + 1,
            pathname.length
        );
    } else {
        // Get the working directory for the compiler
        pathInformation.workDir = fullpathname.substring(0, srcPos);

        // Get the file name
        pathInformation.file = fullpathname.substring(srcPos + 5, fullpathname.length);
    }

    return pathInformation;
}
