import {FileSystemHost} from "./../../FileSystemHost";
import {FileUtils} from "./../../utils";

export interface CustomFileSystemProps {
    getSyncWriteLog(): { filePath: string; fileText: string; }[];
    getWriteLog(): { filePath: string; fileText: string; }[];
    getCreatedDirectories(): string[];
}

export function getFileSystemHostWithFiles(files: { filePath: string; text: string; }[]): FileSystemHost & CustomFileSystemProps {
    files.forEach(file => {
        file.filePath = FileUtils.getStandardizedAbsolutePath(file.filePath);
    });
    const writeLog: { filePath: string; fileText: string; }[] = [];
    const syncWriteLog: { filePath: string; fileText: string; }[] = [];
    const directories: string[] = [];
    return {
        readFile: filePath => {
            const file = files.find(f => f.filePath === filePath);
            if (file == null)
                throw new Error(`Can't find file ${filePath}.`);
            return file.text;
        },
        writeFile: (filePath, fileText) => {
            writeLog.push({ filePath, fileText });
            files.push({ filePath, text: fileText });
            return Promise.resolve();
        },
        writeFileSync: (filePath, fileText) => {
            syncWriteLog.push({ filePath, fileText });
            files.push({ filePath, text: fileText });
        },
        fileExists: filePath => {
            filePath = FileUtils.getStandardizedAbsolutePath(filePath);
            return Promise.resolve(files.some(f => f.filePath === filePath));
        },
        fileExistsSync: filePath => {
            filePath = FileUtils.getStandardizedAbsolutePath(filePath);
            return files.some(f => f.filePath === filePath);
        },
        getCurrentDirectory: () => FileUtils.getCurrentDirectory(),
        mkdir: dirPath => {
            directories.push(dirPath);
            return Promise.resolve();
        },
        mkdirSync: dirPath => directories.push(dirPath),
        directoryExists: dirPath => Promise.resolve(directories.indexOf(dirPath) >= 0),
        directoryExistsSync: dirPath => directories.indexOf(dirPath) >= 0,
        glob: patterns => [] as string[],
        getSyncWriteLog: () => [...syncWriteLog],
        getWriteLog: () => [...writeLog],
        getCreatedDirectories: () => [...directories]
    };
}
