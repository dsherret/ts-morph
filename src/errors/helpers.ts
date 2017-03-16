import * as ts from "typescript";
import {ArgumentTypeError} from "./ArgumentTypeError";
import {ArgumentNullOrWhitespaceError} from "./ArgumentNullOrWhitespaceError";
import {NotImplementedError} from "./NotImplementedError";

export function throwIfNotType(value: any, expectedType: string, argName: string) {
    if (typeof value !== expectedType)
        throw new ArgumentTypeError(argName, expectedType, typeof value);
}

export function throwIfNotStringOrWhitespace(value: string, argName: string) {
    if (typeof value !== "string")
        throw new ArgumentTypeError(argName, "string", typeof value);
    if (value.trim().length === 0)
        throw new ArgumentNullOrWhitespaceError(argName);
}

export function getNotImplementedForSyntaxKindError(syntaxKind: ts.SyntaxKind) {
    return new NotImplementedError(`Not implemented feature for syntax kind '${ts.SyntaxKind[syntaxKind]}'.`);
}
