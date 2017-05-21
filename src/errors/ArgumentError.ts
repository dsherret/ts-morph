import {BaseError} from "./BaseError";

export class ArgumentError extends BaseError {
    constructor(public readonly argName: string, message: string) {
        super(`Argument Error (${argName}): ${message}`);
    }
}
