export interface FileSystemHost {
    readFile(filePath: string): string;
    fileExists(filePath: string): boolean;
    getAbsolutePath(filePath: string): string;
    normalize(filePath: string): string;
    getDirectoryName(filePath: string): string;
    pathJoin(...paths: string[]): string;
}
