import { ArgumentError } from "./ArgumentError";

export class ArgumentNullOrWhitespaceError extends ArgumentError {
    /** @internal */
    constructor(argName: string) {
        super(argName, "Cannot be null or whitespace.", ArgumentNullOrWhitespaceError.prototype);
    }
}
