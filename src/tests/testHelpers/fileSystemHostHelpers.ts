import {FileSystemHost} from "./../../FileSystemHost";
import * as path from "path";

export function getFileSystemHostWithFiles(files: { filePath: string; text: string; }[]): FileSystemHost {
    return {
        readFile: filePath => files.find(f => f.filePath === filePath)!.text,
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
