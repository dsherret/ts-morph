import { BaseError } from "./BaseError";

export class NotSupportedError extends BaseError {
    /** @internal */
    constructor(message: string) {
        super(message, NotSupportedError.prototype);
    }
}
