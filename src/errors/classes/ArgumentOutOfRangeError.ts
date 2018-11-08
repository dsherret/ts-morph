import { ArgumentError } from "./ArgumentError";

export class ArgumentOutOfRangeError extends ArgumentError {
    /** @private */
    constructor(argName: string, value: number, range: [number, number]) {
        super(argName, `Range is ${range[0]} to ${range[1]}, but ${value} was provided.`, ArgumentOutOfRangeError.prototype);
    }
}
