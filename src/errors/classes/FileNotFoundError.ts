import { PathNotFoundError } from "./PathNotFoundError";

export class FileNotFoundError extends PathNotFoundError {
    /** @private */
    constructor(filePath: string) {
        super(filePath, "File", FileNotFoundError.prototype);
    }
}
