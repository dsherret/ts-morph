import { ArgumentError } from "./ArgumentError";

export class ArgumentNullOrWhitespaceError extends ArgumentError {
    /** @private */
    constructor(argName: string) {
        super(argName, "Cannot be null or whitespace.", ArgumentNullOrWhitespaceError.prototype);
    }
}
