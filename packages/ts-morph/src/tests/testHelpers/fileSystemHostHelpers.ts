import { KeyValueCache, FileSystemHost, InMemoryFileSystemHost } from "@ts-morph/common";

export interface CustomFileSystemProps {
    getWriteLog(): { filePath: string; fileText: string; }[];
    getDeleteLog(): { path: string; }[];
    getCreatedDirectories(): string[];
    clearDeleteLog(): void;
    clearCreatedDirectories(): void;
    getFiles(): [string, string][];
}

export function getFileSystemHostWithFiles(
    initialFiles: { filePath: string; text: string; }[],
    initialDirectories: string[] = []
): FileSystemHost
    & CustomFileSystemProps
{
    initialDirectories = initialDirectories.map(d => d[0] === "/" ? d : "/" + d);
    return new VirtualFileSystemForTest(initialFiles, initialDirectories);
}

class VirtualFileSystemForTest extends InMemoryFileSystemHost implements CustomFileSystemProps {
    private readonly writeLog: { filePath: string; fileText: string; }[] = [];
    private readonly deleteLog: { path: string; }[] = [];
    private readonly trackedDirectories = new Set<string>();
    private readonly files = new KeyValueCache<string, string>();

    constructor(initialFiles: { filePath: string; text: string; }[], private readonly initialDirectories: string[] = []) {
        super({ skipLoadingLibFiles: true });

        for (const item of initialDirectories)
            this.trackedDirectories.add(item);
        initialDirectories.forEach(d => this.mkdirSync(d));
        initialFiles.forEach(file => {
            const filePath = file.filePath[0] === "/" ? file.filePath : "/" + file.filePath;
            this.writeFileSync(filePath, file.text);
        });
    }

    deleteSync(path: string) {
        this.doDelete(path);
        super.deleteSync(path);
    }

    writeFileSync(filePath: string, fileText: string) {
        this.files.set(filePath, fileText);
        this.writeLog.push({ filePath, fileText });
        super.writeFileSync(filePath, fileText);
    }

    mkdirSync(dirPath: string) {
        this.trackedDirectories.add(dirPath);
        super.mkdirSync(dirPath);
    }

    getWriteLog() {
        return [...this.writeLog];
    }

    getDeleteLog() {
        return [...this.deleteLog];
    }

    getFiles() {
        return Array.from(this.files.getEntries());
    }

    getCreatedDirectories() {
        return [...this.trackedDirectories.values()].filter(path => this.initialDirectories.indexOf(path) === -1);
    }

    clearCreatedDirectories() {
        this.trackedDirectories.clear();
    }

    clearDeleteLog() {
        this.deleteLog.length = 0;
    }

    private doDelete(path: string) {
        this.deleteLog.push({ path });
        this.files.removeByKey(path);
        this.trackedDirectories.delete(path);
    }
}
