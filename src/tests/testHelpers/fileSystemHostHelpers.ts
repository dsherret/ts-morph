import {FileSystemHost} from "./../../FileSystemHost";
import {FileUtils} from "./../../utils";

export interface CustomFileSystemProps {
    getSyncWriteLog(): { filePath: string; fileText: string; }[];
    getWriteLog(): { filePath: string; fileText: string; }[];
}

export function getFileSystemHostWithFiles(files: { filePath: string; text: string; }[]): FileSystemHost & CustomFileSystemProps {
    files.forEach(file => {
        file.filePath = FileUtils.getStandardizedAbsolutePath(file.filePath);
    });
    const writeLog: { filePath: string; fileText: string; }[] = [];
    const syncWriteLog: { filePath: string; fileText: string; }[] = [];
    return {
        readFile: filePath => {
            const file = files.find(f => f.filePath === filePath);
            if (file == null)
                throw new Error(`Can't find file ${filePath}.`);
            return file.text;
        },
        writeFile: (filePath, fileText) => {
            return new Promise((resolve, reject) => {
                writeLog.push({ filePath, fileText });
                files.push({ filePath, text: fileText });
                resolve();
            });
        },
        writeFileSync: (filePath, fileText) => {
            syncWriteLog.push({ filePath, fileText });
            files.push({ filePath, text: fileText });
        },
        fileExists: filePath => {
            filePath = FileUtils.getStandardizedAbsolutePath(filePath);
            return files.some(f => f.filePath === filePath);
        },
        getCurrentDirectory: () => FileUtils.getCurrentDirectory(),
        directoryExists: dirName => true,
        glob: patterns => [] as string[],
        getSyncWriteLog: () => [...syncWriteLog],
        getWriteLog: () => [...writeLog]
    };
}
