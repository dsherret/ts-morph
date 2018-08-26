import { BaseError } from "./BaseError";

export class DirectoryNotFoundError extends BaseError {
    constructor(public readonly dirPath: string) {
        super(`Directory not found: ${dirPath}`, DirectoryNotFoundError.prototype);
    }

    readonly code = "ENOENT";
}
