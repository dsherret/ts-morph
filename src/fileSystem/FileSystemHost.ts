export interface FileSystemHost {
    delete(path: string): Promise<void>;
    deleteSync(path: string): void;
    readFile(filePath: string, encoding?: string): Promise<string>;
    readFileSync(filePath: string, encoding?: string): string;
    writeFile(filePath: string, fileText: string): Promise<void>;
    writeFileSync(filePath: string, fileText: string): void;
    mkdir(dirPath: string): Promise<void>;
    mkdirSync(dirPath: string): void;
    fileExists(filePath: string): Promise<boolean>;
    fileExistsSync(filePath: string): boolean;
    directoryExists(dirPath: string): Promise<boolean>;
    directoryExistsSync(dirPath: string): boolean;
    getCurrentDirectory(): string;
    glob(patterns: string[]): string[];
}
