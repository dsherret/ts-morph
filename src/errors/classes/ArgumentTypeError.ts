import { ArgumentError } from "./ArgumentError";

export class ArgumentTypeError extends ArgumentError {
    /** @internal */
    constructor(argName: string, expectedType: string, actualType: string) {
        super(argName, `Expected type '${expectedType}', but was '${actualType}'.`, ArgumentTypeError.prototype);
    }
}
