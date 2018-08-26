import { BaseError } from "./BaseError";

export class FileNotFoundError extends BaseError {
    constructor(public readonly filePath: string) {
        super(`File not found: ${filePath}`, FileNotFoundError.prototype);
    }

    readonly code = "ENOENT";
}
