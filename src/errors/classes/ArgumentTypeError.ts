import { ArgumentError } from "./ArgumentError";

export class ArgumentTypeError extends ArgumentError {
    /** @deprecated Will be removed in next major. */
    readonly expectedType: string;
    /** @deprecated Will be removed in next major. */
    readonly actualType: string;

    /** @internal */
    constructor(argName: string, expectedType: string, actualType: string) {
        super(argName, `Expected type '${expectedType}', but was '${actualType}'.`, ArgumentTypeError.prototype);
        this.expectedType = expectedType;
        this.actualType = actualType;
    }
}
