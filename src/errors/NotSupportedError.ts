import { BaseError } from "./BaseError";

export class NotSupportedError extends BaseError {
    constructor(public message: string) {
        super(message, NotSupportedError.prototype);
    }
}
