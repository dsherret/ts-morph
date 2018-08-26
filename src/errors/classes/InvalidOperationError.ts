import { BaseError } from "./BaseError";

export class InvalidOperationError extends BaseError {
    /** @internal */
    constructor(message: string) {
        super(message, InvalidOperationError.prototype);
    }
}
