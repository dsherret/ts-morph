﻿export interface FileSystemHost {
    /** Gets if this file system is case sensitive. */
    isCaseSensitive(): boolean;
    delete(path: string): Promise<void>;
    deleteSync(path: string): void;
    readDirSync(dirPath: string): string[];
    readFile(filePath: string, encoding?: string): Promise<string>;
    readFileSync(filePath: string, encoding?: string): string;
    writeFile(filePath: string, fileText: string): Promise<void>;
    writeFileSync(filePath: string, fileText: string): void;
    mkdir(dirPath: string): Promise<void>;
    mkdirSync(dirPath: string): void;
    move(srcPath: string, destPath: string): Promise<void>;
    moveSync(srcPath: string, destPath: string): void;
    copy(srcPath: string, destPath: string): Promise<void>;
    copySync(srcPath: string, destPath: string): void;
    fileExists(filePath: string): Promise<boolean>;
    fileExistsSync(filePath: string): boolean;
    directoryExists(dirPath: string): Promise<boolean>;
    directoryExistsSync(dirPath: string): boolean;
    /** See https://nodejs.org/api/fs.html#fs_fs_realpathsync_path_options */
    realpathSync(path: string): string;
    getCurrentDirectory(): string;
    glob(patterns: ReadonlyArray<string>): string[];
}
