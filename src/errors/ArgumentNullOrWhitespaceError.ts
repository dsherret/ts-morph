import {BaseError} from "./BaseError";

export class ArgumentNullOrWhitespaceError extends BaseError {
    constructor(public readonly argName: string) {
        super(`Argument '${argName}' was null or whitespace.`);
    }
}
