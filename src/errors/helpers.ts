import * as ts from "typescript";
import {Node} from "./../compiler";
import {ArgumentTypeError} from "./ArgumentTypeError";
import {ArgumentNullOrWhitespaceError} from "./ArgumentNullOrWhitespaceError";
import {ArgumentOutOfRangeError} from "./ArgumentOutOfRangeError";
import {NotImplementedError} from "./NotImplementedError";

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
 * Throws if the value is not a string or is whitespace.
 * @param value - Value to check.
 * @param argName - Arg name.
 */
export function throwIfNotStringOrWhitespace(value: string, argName: string) {
    if (typeof value !== "string")
        throw new ArgumentTypeError(argName, "string", typeof value);
    if (value.trim().length === 0)
        throw new ArgumentNullOrWhitespaceError(argName);
}

/**
 * Throws a NotImplementedError if a node doesn't match the expected syntax kind.
 * @param node - Node.
 * @param syntaxKind - Syntax kind that's expected.
 * @param message - Optional message to throw.
 */
export function throwIfNotSyntaxKind(node: Node, syntaxKind: ts.SyntaxKind, message?: string) {
    if (node.getKind() !== syntaxKind)
        throw new NotImplementedError(message || `Expected node to be syntax kind ${ts.SyntaxKind[syntaxKind]}, but was ${node.getKindName()}.`);
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
 * Gets an error saying that a feature is not implemented for a certain syntax kind.
 * @param syntaxKind - Syntax kind that isn't implemented.
 */
export function getNotImplementedForSyntaxKindError(syntaxKind: ts.SyntaxKind) {
    return new NotImplementedError(`Not implemented feature for syntax kind '${ts.SyntaxKind[syntaxKind]}'.`);
}
