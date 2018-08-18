import { BaseError } from "./BaseError";

export class NotImplementedError extends BaseError {
    constructor(public message = "Not implemented.") {
        super(message, NotImplementedError.prototype);
    }
}
