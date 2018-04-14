import { BaseError } from "./BaseError";

export class NotImplementedError extends BaseError {
    constructor(public message: string) {
        super(message, NotImplementedError.prototype);
    }
}
