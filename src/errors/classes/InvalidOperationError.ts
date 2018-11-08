import { BaseError } from "./BaseError";

export class InvalidOperationError extends BaseError {
    /** @private */
    constructor(message: string) {
        super(message, InvalidOperationError.prototype);
    }
}
