import {BaseError} from "./BaseError";

export class ArgumentOutOfRangeError extends BaseError {
    constructor(public readonly argName: string, value: number, range: [number, number]) {
        super(`Argument Error (${argName}): Range is ${range[0]} to ${range[1]}, but ${value} was provided.`);
    }
}
