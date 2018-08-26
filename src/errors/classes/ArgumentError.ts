import { BaseError } from "./BaseError";

export class ArgumentError extends BaseError {
    /** @deprecated Will be removed in next major. */
    public readonly argName: string;

    /** @internal */
    constructor(argName: string, message: string, prototype: any = ArgumentError.prototype) {
        super(`Argument Error (${argName}): ${message}`, prototype);
        this.argName = argName;
    }
}
