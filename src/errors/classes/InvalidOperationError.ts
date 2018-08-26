import { BaseError } from "./BaseError";

export class InvalidOperationError extends BaseError {
    constructor(public message: string) {
        super(message, InvalidOperationError.prototype);
    }
}
