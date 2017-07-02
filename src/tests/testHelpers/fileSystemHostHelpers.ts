import {FileSystemHost} from "./../../FileSystemHost";
import {FileUtils} from "./../../utils";

export interface CustomFileSystemProps {
    getWrittenFileArguments(): any[];
    getSyncWriteLog(): string[];
    getWriteLog(): string[];
}

export function getFileSystemHostWithFiles(files: { filePath: string; text: string; }[]): FileSystemHost & CustomFileSystemProps {
    files.forEach(file => {
        file.filePath = FileUtils.getStandardizedAbsolutePath(file.filePath);
    });
    let writtenFileArgs: any[];
    const writeLog: string[] = [];
    const syncWriteLog: string[] = [];
    return {
        readFile: filePath => files.find(f => f.filePath === filePath)!.text,
        writeFile: (filePath, fileText) => {
            writtenFileArgs = [filePath, fileText];
            return new Promise((resolve, reject) => {
                writeLog.push(filePath);
                resolve();
            });
        },
        writeFileSync: (filePath, fileText) => {
            writtenFileArgs = [filePath, fileText];
            syncWriteLog.push(filePath);
        },
        fileExists: filePath => {
            filePath = FileUtils.getStandardizedAbsolutePath(filePath);
            return files.some(f => f.filePath === filePath);
        },
        getCurrentDirectory: () => FileUtils.getCurrentDirectory(),
        directoryExists: dirName => true,
        glob: patterns => [] as string[],
        getWrittenFileArguments: () => writtenFileArgs,
        getSyncWriteLog: () => [...syncWriteLog],
        getWriteLog: () => [...writeLog]
    };
}
