import * as fs from "fs";
import * as globby from "globby";
import {FileSystemHost} from "./FileSystemHost";
import {FileUtils} from "./utils";

/**
 * @internal
 */
export class DefaultFileSystemHost implements FileSystemHost {
    readFile(filePath: string, encoding = "utf-8") {
        return fs.readFileSync(filePath, encoding);
    }

    writeFile(filePath: string, fileText: string, callback?: (err: NodeJS.ErrnoException) => void) {
        fs.writeFile(filePath, fileText, callback);
    }

    writeFileSync(filePath: string, fileText: string) {
        fs.writeFileSync(filePath, fileText);
    }

    fileExists(filePath: string) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    }

    directoryExists(dirPath: string) {
        try {
            return fs.statSync(dirPath).isDirectory();
        } catch (err) {
            return false;
        }
    }

    getCurrentDirectory() {
        return FileUtils.getCurrentDirectory();
    }

    glob(patterns: string[]) {
        return globby.sync(patterns);
    }
}
