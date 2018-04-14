import { ArgumentError } from "./ArgumentError";

export class ArgumentTypeError extends ArgumentError {
    constructor(public readonly argName: string, public readonly expectedType: string, public readonly actualType: string) {
        super(argName, `Expected type '${expectedType}', but was '${actualType}'.`, ArgumentTypeError.prototype);
    }
}
