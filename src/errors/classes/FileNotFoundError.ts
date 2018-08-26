import { PathNotFoundError } from "./PathNotFoundError";

export class FileNotFoundError extends PathNotFoundError {
    /** @deprecated Use path. */
    public readonly filePath: string;

    /** @internal */
    constructor(filePath: string) {
        super(filePath, "File", FileNotFoundError.prototype);
        this.filePath = filePath;
    }
}
