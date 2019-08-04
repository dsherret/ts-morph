import { BaseError } from "./BaseError";

export class NotSupportedError extends BaseError {
    /** @private */
    constructor(message: string) {
        super(message, NotSupportedError.prototype);
    }
}
