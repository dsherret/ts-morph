import {CompilerFactory} from "../factories";
import * as errors from "../errors";
import {FileUtils} from "../utils";
import {FileSystemWrapper} from "./FileSystemWrapper";
import {Directory, AddDirectoryOptions} from "./Directory";

/**
 * Contains common methods between Project and Directory.
 *
 * I'll definitely need to refactor this in the future... just putting these methods in a common place for now.
 */
export class DirectoryCoordinator {
    constructor(private readonly compilerFactory: CompilerFactory, private readonly fileSystemWrapper: FileSystemWrapper) {
    }

    addDirectoryIfExists(dirPath: string, options: AddDirectoryOptions) {
        const directory = this.compilerFactory.getDirectoryFromPath(dirPath);
        if (directory == null)
            return undefined;

        if (options.recursive) {
            for (const descendantDirPath of FileUtils.getDescendantDirectories(this.fileSystemWrapper, dirPath))
                this.compilerFactory.createOrAddDirectoryIfNotExists(descendantDirPath);
        }

        return directory;
    }

    addExistingDirectory(dirPath: string, options: AddDirectoryOptions) {
        const directory = this.addDirectoryIfExists(dirPath, options);
        if (directory == null)
            throw new errors.DirectoryNotFoundError(dirPath);
        return directory;
    }

    createDirectory(dirPath: string) {
        return this.compilerFactory.createDirectory(dirPath);
    }
}
