export interface FileSystemHost {
    readFile(filePath: string, encoding?: string): string;
    fileExists(filePath: string): boolean;
    directoryExists(dirPath: string): boolean;
    getAbsolutePath(filePath: string): string;
    normalize(filePath: string): string;
    getDirectoryName(filePath: string): string;
    pathJoin(...paths: string[]): string;
    getCurrentDirectory(): string;
}
