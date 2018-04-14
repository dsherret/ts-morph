import { ArgumentError } from "./ArgumentError";

export class ArgumentNullOrWhitespaceError extends ArgumentError {
    constructor(public readonly argName: string) {
        super(argName, "Cannot be null or whitespace.", ArgumentNullOrWhitespaceError.prototype);
    }
}
