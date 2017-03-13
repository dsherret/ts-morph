import {BaseError} from "./BaseError";

export class ArgumentTypeError extends BaseError {
    constructor(public readonly argName: string, public readonly expectedType: string) {
        super(`Argument '${argName}' expects type '${expectedType}'.`);
    }
}
