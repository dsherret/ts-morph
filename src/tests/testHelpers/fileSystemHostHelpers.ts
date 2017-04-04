import {FileSystemHost} from "./../../FileSystemHost";
import * as path from "path";

export function getFileSystemHostWithFiles(files: { filePath: string; text: string; }[]): FileSystemHost & { getWrittenFileArguments: () => any[]; } {
    let writtenFileArgs: any[];
    return {
        readFile: filePath => files.find(f => f.filePath === filePath)!.text,
        writeFile: (filePath, fileText, callback) => {
            writtenFileArgs = [filePath, fileText, callback];
            if (callback)
                (callback as any)();
        },
        writeFileSync: (filePath, fileText) => {
            writtenFileArgs = [filePath, fileText];
        },
        getWrittenFileArguments: () => {
            return writtenFileArgs;
        },
        fileExists: filePath => files.some(f => f.filePath === filePath),
        getAbsolutePath: filePath => filePath,
        normalize: filePath => path.normalize(filePath),
        getDirectoryName: filePath => path.dirname(filePath),
        pathJoin: (...paths) => path.join(...paths),
        getCurrentDirectory: () => "/",
        directoryExists: dirName => true,
        glob: patterns => [] as string[]
    };
}
