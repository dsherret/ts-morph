import { PathNotFoundError } from "./PathNotFoundError";

export class FileNotFoundError extends PathNotFoundError {
    /** @internal */
    constructor(filePath: string) {
        super(filePath, "File", FileNotFoundError.prototype);
    }
}
