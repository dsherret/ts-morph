import * as ts from "typescript";
import {ArgumentTypeError} from "./ArgumentTypeError";
import {ArgumentNullOrWhitespaceError} from "./ArgumentNullOrWhitespaceError";
import {NotImplementedError} from "./NotImplementedError";

export function throwIfNotType(value: string, expectedType: string, argName: string) {
    if (typeof value !== expectedType)
        throw new ArgumentTypeError(argName, expectedType);
}

export function throwIfNotStringOrWhitespace(value: string, argName: string) {
    if (typeof value !== "string")
        throw new ArgumentTypeError(argName, "string");
    if (value == null || value.trim().length === 0)
        throw new ArgumentNullOrWhitespaceError(argName);
}

export function getNotImplementedForSyntaxKindError(syntaxKind: ts.SyntaxKind) {
    return new NotImplementedError(`Not implemented feature for syntax kind '${ts.SyntaxKind[syntaxKind]}'.`);
}
