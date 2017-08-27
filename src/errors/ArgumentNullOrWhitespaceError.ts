import {ArgumentError} from "./ArgumentError";

export class ArgumentNullOrWhitespaceError extends ArgumentError {
    constructor(public readonly argName: string) {
        super(argName, "Was null or whitespace.");
    }
}
