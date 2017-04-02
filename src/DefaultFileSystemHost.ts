import * as fs from "fs";
import * as path from "path";
import {FileSystemHost} from "./FileSystemHost";

/**
 * @internal
 */
export class DefaultFileSystemHost implements FileSystemHost {
    readFile(filePath: string) {
        return fs.readFileSync(filePath, "utf-8");
    }

    fileExists(filePath: string) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    }

    getAbsolutePath(filePath: string) {
        return path.resolve(filePath);
    }

    normalize(filePath: string) {
        return path.normalize(filePath);
    }

    getDirectoryName(filePath: string) {
        return path.dirname(filePath);
    }

    pathJoin(...paths: string[]) {
        return path.join(...paths);
    }
}
