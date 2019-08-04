import { BaseError } from "./BaseError";

export class PathNotFoundError extends BaseError {
    /** @private */
    constructor(public readonly path: string, prefix = "Path", prototype: any = PathNotFoundError.prototype) {
        super(`${prefix} not found: ${path}`, prototype);
    }

    readonly code: "ENOENT" = "ENOENT";
}
