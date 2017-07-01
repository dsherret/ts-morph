import {FileSystemHost} from "./../../FileSystemHost";
import {FileUtils} from "./../../utils";

export function getFileSystemHostWithFiles(files: { filePath: string; text: string; }[]): FileSystemHost & { getWrittenFileArguments: () => any[]; } {
    files.forEach(file => {
        file.filePath = FileUtils.getStandardizedAbsolutePath(file.filePath);
    });
    let writtenFileArgs: any[];
    return {
        readFile: filePath => files.find(f => f.filePath === filePath)!.text,
        writeFile: (filePath, fileText) => {
            writtenFileArgs = [filePath, fileText];
            return new Promise((resolve, reject) => {
                resolve();
            });
        },
        writeFileSync: (filePath, fileText) => {
            writtenFileArgs = [filePath, fileText];
        },
        getWrittenFileArguments: () => {
            return writtenFileArgs;
        },
        fileExists: filePath => {
            filePath = FileUtils.getStandardizedAbsolutePath(filePath);
            return files.some(f => f.filePath === filePath);
        },
        getCurrentDirectory: () => FileUtils.getCurrentDirectory(),
        directoryExists: dirName => true,
        glob: patterns => [] as string[]
    };
}
