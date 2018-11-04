import { BaseError } from "./BaseError";

export class ArgumentError extends BaseError {
    /** @private */
    constructor(argName: string, message: string, prototype: any = ArgumentError.prototype) {
        super(`Argument Error (${argName}): ${message}`, prototype);
    }
}
