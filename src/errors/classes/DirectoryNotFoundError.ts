import { PathNotFoundError } from "./PathNotFoundError";

export class DirectoryNotFoundError extends PathNotFoundError {
    /** @deprecated Use path. */
    public readonly dirPath: string;

    /** @internal */
    constructor(dirPath: string) {
        super(dirPath, "Directory", DirectoryNotFoundError.prototype);
        this.dirPath = dirPath;
    }
}
