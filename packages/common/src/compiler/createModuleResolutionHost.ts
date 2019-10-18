import { FileUtils, TransactionalFileSystem } from "../fileSystem";
import { ts } from "../typescript";
import { TsSourceFileContainer } from "./TsSourceFileContainer";

/**
 * Options for creating a module resolution host.
 */
export interface CreateModuleResolutionHostOptions {
    /** The transactional file system to use. */
    transactionalFileSystem: TransactionalFileSystem;
    /** The source file container to use. */
    sourceFileContainer: TsSourceFileContainer;
    /** Gets the encoding to use. */
    getEncoding(): string;
}

/**
 * Creates a module resolution host based on the provided options.
 * @param options - Options for creating the module resolution host.
 */
export function createModuleResolutionHost(options: CreateModuleResolutionHostOptions): ts.ModuleResolutionHost {
    const { transactionalFileSystem, sourceFileContainer, getEncoding } = options;
    return {
        directoryExists: dirName => {
            if (sourceFileContainer.containsDirectoryAtPath(dirName))
                return true;
            return transactionalFileSystem.directoryExistsSync(dirName);
        },
        fileExists: fileName => {
            if (sourceFileContainer.containsSourceFileAtPath(fileName))
                return true;
            return transactionalFileSystem.fileExistsSync(fileName);
        },
        readFile: fileName => {
            const sourceFile = sourceFileContainer.getSourceFileFromCacheFromFilePath(fileName);
            if (sourceFile != null)
                return sourceFile.getFullText();

            try {
                return transactionalFileSystem.readFileSync(fileName, getEncoding());
            } catch (err) {
                // this is what the compiler api does
                if (FileUtils.isNotExistsError(err))
                    return undefined;
                throw err;
            }
        },
        getCurrentDirectory: () => transactionalFileSystem.getCurrentDirectory(),
        getDirectories: path => {
            const dirs = new Set<string>(transactionalFileSystem.readDirSync(path));
            for (const dirPath of sourceFileContainer.getChildDirectoriesOfDirectory(path))
                dirs.add(dirPath);
            return Array.from(dirs);
        },
        realpath: path => transactionalFileSystem.realpathSync(path)
    };
}
