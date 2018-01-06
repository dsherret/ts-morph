import {FileNotFoundError} from "./../../errors";
import {FileSystemHost} from "./../../fileSystem";
import {ArrayUtils, KeyValueCache} from "./../../utils";

export interface CustomFileSystemProps {
    getSyncWriteLog(): { filePath: string; fileText: string; }[];
    getWriteLog(): { filePath: string; fileText: string; }[];
    getDeleteLog(): { path: string; }[];
    getCreatedDirectories(): string[];
    getFiles(): [string, string][];
}

export function getFileSystemHostWithFiles(initialFiles: { filePath: string; text: string; }[], initialDirectories: string[] = []): FileSystemHost & CustomFileSystemProps {
    initialDirectories = initialDirectories.map(d => d[0] === "/" ? d : "/" + d);
    const writeLog: { filePath: string; fileText: string; }[] = [];
    const deleteLog: { path: string; }[] = [];
    const syncWriteLog: { filePath: string; fileText: string; }[] = [];
    const directories = [...initialDirectories];
    const files = new KeyValueCache<string, string>();

    initialFiles.forEach(file => {
        const filePath = file.filePath[0] === "/" ? file.filePath : "/" + file.filePath;
        files.set(filePath, file.text);
    });

    return {
        delete: path => {
            doDelete(path);
            return Promise.resolve();
        },
        deleteSync: path => {
            doDelete(path);
        },
        readFile: filePath => Promise.resolve(readFile(filePath)),
        readFileSync: filePath => readFile(filePath),
        writeFile: (filePath, fileText) => {
            writeLog.push({ filePath, fileText });
            files.set(filePath, fileText);
            return Promise.resolve();
        },
        readDirSync: () => [],
        writeFileSync: (filePath, fileText) => {
            syncWriteLog.push({ filePath, fileText });
            files.set(filePath, fileText);
        },
        fileExists: filePath => {
            return Promise.resolve(files.has(filePath));
        },
        fileExistsSync: filePath => {
            return files.has(filePath);
        },
        getCurrentDirectory: () => "/",
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
        getFiles: () => ArrayUtils.from(files.getEntries()),
        getCreatedDirectories: () => [...directories].filter(path => initialDirectories.indexOf(path) === -1)
    };

    function readFile(filePath: string) {
        if (!files.has(filePath))
            throw new FileNotFoundError(`Can't find file ${filePath}.`);
        return files.get(filePath) || "";
    }

    function doDelete(path: string) {
        deleteLog.push({ path });
        files.removeByKey(path);
    }
}
