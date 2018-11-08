import { PathNotFoundError } from "./PathNotFoundError";

export class DirectoryNotFoundError extends PathNotFoundError {
    /** @private */
    constructor(dirPath: string) {
        super(dirPath, "Directory", DirectoryNotFoundError.prototype);
    }
}
