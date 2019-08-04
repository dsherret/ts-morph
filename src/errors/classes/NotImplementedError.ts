import { BaseError } from "./BaseError";

export class NotImplementedError extends BaseError {
    /** @private */
    constructor(message = "Not implemented.") {
        super(message, NotImplementedError.prototype);
    }
}
