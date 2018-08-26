import { BaseError } from "./BaseError";

export class ArgumentError extends BaseError {
    constructor(public readonly argName: string, message: string, prototype: any = ArgumentError.prototype) {
        super(`Argument Error (${argName}): ${message}`, prototype);
    }
}
