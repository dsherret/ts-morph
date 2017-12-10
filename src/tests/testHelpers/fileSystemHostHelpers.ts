import {FileSystemHost} from "./../../fileSystem";
import {FileUtils, ArrayUtils} from "./../../utils";

export interface CustomFileSystemProps {
    getSyncWriteLog(): { filePath: string; fileText: string; }[];
    getWriteLog(): { filePath: string; fileText: string; }[];
    getDeleteLog(): { path: string; }[];
    getCreatedDirectories(): string[];
    getFiles(): { filePath: string; text: string; }[];
}

export function getFileSystemHostWithFiles(files: { filePath: string; text: string; }[], initialDirectories: string[] = []): FileSystemHost & CustomFileSystemProps {
    files.forEach(file => {
        file.filePath = FileUtils.getStandardizedAbsolutePath(file.filePath);
    });
    const writeLog: { filePath: string; fileText: string; }[] = [];
    const deleteLog: { path: string; }[] = [];
    const syncWriteLog: { filePath: string; fileText: string; }[] = [];
    const directories = [...initialDirectories];

    return {
        delete: path => {
            doDelete(path);
            return Promise.resolve();
        },
        deleteSync: path => {
            doDelete(path);
        },
        readFile: filePath => {
            const file = ArrayUtils.find(files, f => f.filePath === filePath);
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
        getDeleteLog: () => [...deleteLog],
        getFiles: () => [...files],
        getCreatedDirectories: () => [...directories].filter(path => initialDirectories.indexOf(path) === -1)
    };

    function doDelete(path: string) {
        deleteLog.push({ path });
        const fileItem = ArrayUtils.find(files, item => item.filePath === path);
        if (fileItem != null)
            ArrayUtils.removeFirst(files, fileItem);
    }
}
