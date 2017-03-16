import {BaseError} from "./BaseError";

export class ArgumentTypeError extends BaseError {
    constructor(public readonly argName: string, public readonly expectedType: string, public readonly actualType: string) {
        super(`Argument '${argName}' expects type '${expectedType}', but was '${actualType}'.`);
    }
}
