import { BaseError } from "./BaseError";

export class ArgumentError extends BaseError {
    /** @internal */
    constructor(argName: string, message: string, prototype: any = ArgumentError.prototype) {
        super(`Argument Error (${argName}): ${message}`, prototype);
    }
}
