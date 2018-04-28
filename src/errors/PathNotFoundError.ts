import { BaseError } from "./BaseError";

export class PathNotFoundError extends BaseError {
    constructor(public readonly path: string) {
        super(`Path not found: ${path}`, PathNotFoundError.prototype);
    }

    readonly code = "ENOENT";
}
