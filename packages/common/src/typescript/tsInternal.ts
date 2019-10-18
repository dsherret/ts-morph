import { ts } from "../typescript";

export function matchFiles(
    this: any,
    path: string,
    extensions: ReadonlyArray<string>,
    excludes: ReadonlyArray<string>,
    includes: ReadonlyArray<string>,
    useCaseSensitiveFileNames: boolean,
    currentDirectory: string,
    depth: number | undefined,
    getEntries: (path: string) => FileSystemEntries,
    realpath: (path: string) => string
): string[] {
    return (ts as any).matchFiles.apply(this, arguments);
}

export interface FileMatcherPatterns {
    /** One pattern for each "include" spec. */
    includeFilePatterns: ReadonlyArray<string>;
    /** One pattern matching one of any of the "include" specs. */
    includeFilePattern: string;
    includeDirectoryPattern: string;
    excludePattern: string;
    basePaths: ReadonlyArray<string>;
}

export function getFileMatcherPatterns(
    this: any,
    path: string,
    excludes: ReadonlyArray<string>,
    includes: ReadonlyArray<string>,
    useCaseSensitiveFileNames: boolean,
    currentDirectory: string
): FileMatcherPatterns {
    return (ts as any).getFileMatcherPatterns.apply(this, arguments);
}

export interface FileSystemEntries {
    readonly files: ReadonlyArray<string>;
    readonly directories: ReadonlyArray<string>;
}

export function getEmitModuleResolutionKind(this: any, compilerOptions: ts.CompilerOptions) {
    return (ts as any).getEmitModuleResolutionKind.apply(this, arguments);
}
