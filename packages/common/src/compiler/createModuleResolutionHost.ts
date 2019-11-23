import { FileUtils, TransactionalFileSystem, StandardizedFilePath } from "../fileSystem";
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
            const dirPath = transactionalFileSystem.getStandardizedAbsolutePath(dirName);
            if (sourceFileContainer.containsDirectoryAtPath(dirPath))
                return true;
            return transactionalFileSystem.directoryExistsSync(dirPath);
        },
        fileExists: fileName => {
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            if (sourceFileContainer.containsSourceFileAtPath(filePath))
                return true;
            return transactionalFileSystem.fileExistsSync(filePath);
        },
        readFile: fileName => {
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            const sourceFile = sourceFileContainer.getSourceFileFromCacheFromFilePath(filePath);
            if (sourceFile != null)
                return sourceFile.getFullText();

            try {
                return transactionalFileSystem.readFileSync(filePath, getEncoding());
            } catch (err) {
                // this is what the compiler api does
                if (FileUtils.isNotExistsError(err))
                    return undefined;
                throw err;
            }
        },
        getCurrentDirectory: () => transactionalFileSystem.getCurrentDirectory(),
        getDirectories: dirName => {
            const dirPath = transactionalFileSystem.getStandardizedAbsolutePath(dirName);
            const dirs = new Set<StandardizedFilePath>(transactionalFileSystem.readDirSync(dirPath));
            for (const childDirPath of sourceFileContainer.getChildDirectoriesOfDirectory(dirPath))
                dirs.add(childDirPath);
            return Array.from(dirs);
        },
        realpath: path => transactionalFileSystem.realpathSync(transactionalFileSystem.getStandardizedAbsolutePath(path))
    };
}
