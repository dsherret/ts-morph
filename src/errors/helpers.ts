import { Node } from "../compiler";
import { FileSystemWrapper } from "../fileSystem";
import { SyntaxKind } from "../typescript";
import { getSyntaxKindName } from "../utils/compiler/getSyntaxKindName";
import { ArgumentError } from "./ArgumentError";
import { ArgumentNullOrWhitespaceError } from "./ArgumentNullOrWhitespaceError";
import { ArgumentOutOfRangeError } from "./ArgumentOutOfRangeError";
import { ArgumentTypeError } from "./ArgumentTypeError";
import { FileNotFoundError } from "./FileNotFoundError";
import { InvalidOperationError } from "./InvalidOperationError";
import { NotImplementedError } from "./NotImplementedError";

/**
 * Thows if not a type.
 * @param value - Value to check the type of.
 * @param expectedType - Expected type.
 * @param argName - Argument name.
 */
export function throwIfNotType(value: any, expectedType: string, argName: string) {
    if (typeof value !== expectedType)
        throw new ArgumentTypeError(argName, expectedType, typeof value);
}

/**
 * Throws if the value is not a string.
 * @param value - Value to check.
 * @param argName - Arg name.
 */
export function throwIfNotString(value: string, argName: string) {
    if (typeof value !== "string")
        throw new ArgumentTypeError(argName, "string", typeof value);
}

/**
 * Throws if the value is not a string or is whitespace.
 * @param value - Value to check.
 * @param argName - Arg name.
 */
export function throwIfNotStringOrWhitespace(value: string, argName: string) {
    throwIfNotString(value, argName);
    if (value.trim().length === 0)
        throw new ArgumentNullOrWhitespaceError(argName);
}

/**
 * Throws a NotImplementedError if a node doesn't match the expected syntax kind.
 * @param node - Node.
 * @param kind - Syntax kind that's expected.
 * @param message - Optional message to throw.
 */
export function throwIfNotSyntaxKind(node: Node, kind: SyntaxKind, message?: string) {
    if (node.getKind() !== kind)
        throw new NotImplementedError(message || `Expected node to be syntax kind ${getSyntaxKindName(kind)}, but was ${node.getKindName()}.`);
}

/**
 * Throws an ArgumentOutOfRangeError if an argument's value is out of an inclusive range.
 * @param value - Value.
 * @param range - Range.
 * @param argName - Argument name.
 */
export function throwIfOutOfRange(value: number, range: [number, number], argName: string) {
    if (value < range[0] || value > range[1])
        throw new ArgumentOutOfRangeError(argName, value, range);
}

/**
 * Throws an ArgumentOutOfRangeError if an argument's range value is out of an inclusive range.
 *
 * Also throws when the start of the range is greater than the end.
 * @param actualRange - Range to check.
 * @param range - Range to check against.
 * @param argName - Argument name.
 */
export function throwIfRangeOutOfRange(actualRange: [number, number], range: [number, number], argName: string) {
    if (actualRange[0] > actualRange[1])
        throw new ArgumentError(argName, `The start of a range must not be greater than the end: [${actualRange[0]}, ${actualRange[1]}]`);
    throwIfOutOfRange(actualRange[0], range, argName);
    throwIfOutOfRange(actualRange[1], range, argName);
}

/**
 * Gets an error saying that a feature is not implemented for a certain syntax kind.
 * @param kind - Syntax kind that isn't implemented.
 */
export function getNotImplementedForSyntaxKindError(kind: SyntaxKind) {
    return new NotImplementedError(`Not implemented feature for syntax kind '${getSyntaxKindName(kind)}'.`);
}

/**
 * Throws an Argument
 * @param value
 * @param argName
 */
export function throwIfNegative(value: number, argName: string) {
    if (value < 0)
        throw new ArgumentError(argName, "Expected a non-negative value.");
}

/**
 * Throws when the value is null or undefined.
 * @param value - Value to check.
 * @param errorMessage - Error message to throw when not defined.
 */
export function throwIfNullOrUndefined<T>(value: T | undefined, errorMessage: string | (() => string)) {
    if (value == null)
        throw new InvalidOperationError(typeof errorMessage === "string" ? errorMessage : errorMessage());
    return value;
}

/**
 * Throw if the value should have been the never type.
 * @param value - Value to check.
 */
export function getNotImplementedForNeverValueError(value: never) {
    return new NotImplementedError(`Not implemented value: ${JSON.stringify(value)}`);
}

/**
 * Throws an error if the actual value does not equal the expected value.
 * @param actual - Actual value.
 * @param expected - Expected value.
 * @param description - Message to show in the error. Should be a full sentence that doesn't include the actual and expected values.
 */
export function throwIfNotEqual<T>(actual: T, expected: T, description: string) {
    if (actual !== expected)
        throw new InvalidOperationError(`Expected ${actual} to equal ${expected}. ${description}`);
}

/**
 * Throws if true.
 * @param value - Value to check.
 * @param errorMessage - Error message to throw when true.
 */
export function throwIfTrue(value: boolean | undefined, errorMessage: string) {
    if (value === true)
        throw new InvalidOperationError(errorMessage);
}

/**
 * Throws if the file does not exist.
 * @param fileSystem - File system host.
 * @param filePath - File path.
 */
export function throwIfFileNotExists(fileSystemWrapper: FileSystemWrapper, filePath: string) {
    if (!fileSystemWrapper.fileExistsSync(filePath))
        throw new FileNotFoundError(filePath);
}
