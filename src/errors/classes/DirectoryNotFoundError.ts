import { PathNotFoundError } from "./PathNotFoundError";

export class DirectoryNotFoundError extends PathNotFoundError {
    /** @internal */
    constructor(dirPath: string) {
        super(dirPath, "Directory", DirectoryNotFoundError.prototype);
    }
}
