/* barrel:ignore */
import { FileSystemHost } from "../../fileSystem";
import { ts } from "../../typescript";
import { FileUtils } from "../FileUtils";

/**
 * Helper function for creating a module resolution host from a file system.
 */
export function createModuleResolutionHost(fileSystemHost: FileSystemHost): ts.ModuleResolutionHost {
    return {
        directoryExists: dirName => fileSystemHost.directoryExistsSync(dirName),
        fileExists: fileName => fileSystemHost.fileExistsSync(fileName),
        readFile: fileName => {
            try {
                return fileSystemHost.readFileSync(fileName);
            } catch (err) {
                // this is what the compiler api does
                if (FileUtils.isNotExistsError(err))
                    return undefined;
                throw err;
            }
        },
        getCurrentDirectory: () => fileSystemHost.getCurrentDirectory(),
        getDirectories: path => fileSystemHost.readDirSync(path),
        realpath: path => fileSystemHost.realpathSync(path)
    };
}
