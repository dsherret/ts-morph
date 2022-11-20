import { StandardizedFilePath } from "./fileSystem";
import { getSyntaxKindName } from "./helpers";
import { ts } from "./typescript";
import { StringUtils } from "./utils";

/** Collection of helper functions that can be used to throw errors. */
export namespace errors {
  /**
   * Minimal attributes to show a error message with the node source.
   */
  export interface Node {
    getSourceFile(): {
      getFilePath(): StandardizedFilePath;
      getFullText(): string;
    };
    getStart(): number;
  }

  /** Base error class. */
  export abstract class BaseError extends Error {
    /** @private */
    constructor(message: string, node?: Node) {
      const nodeLocation = node && getPrettyNodeLocation(node);
      const messageWithLocation = nodeLocation ? `${message}\n\n${nodeLocation}` : message;
      super(messageWithLocation);
      this.message = messageWithLocation;
    }
  }

  /** Thrown when there is a problem with a provided argument. */
  export class ArgumentError extends BaseError {
    constructor(argName: string, message: string, node?: Node) {
      super(`Argument Error (${argName}): ${message}`, node);
    }
  }

  /** Thrown when an argument is null or whitespace. */
  export class ArgumentNullOrWhitespaceError extends ArgumentError {
    constructor(argName: string, node?: Node) {
      super(argName, "Cannot be null or whitespace.", node);
    }
  }

  /** Thrown when an argument is out of range. */
  export class ArgumentOutOfRangeError extends ArgumentError {
    constructor(argName: string, value: number, range: [number, number], node?: Node) {
      super(argName, `Range is ${range[0]} to ${range[1]}, but ${value} was provided.`, node);
    }
  }

  /** Thrown when an argument does not match an expected type. */
  export class ArgumentTypeError extends ArgumentError {
    constructor(argName: string, expectedType: string, actualType: string, node?: Node) {
      super(argName, `Expected type '${expectedType}', but was '${actualType}'.`, node);
    }
  }

  /** Thrown when a file or directory path was not found. */
  export class PathNotFoundError extends BaseError {
    constructor(public readonly path: StandardizedFilePath, prefix = "Path") {
      super(`${prefix} not found: ${path}`);
    }

    readonly code: "ENOENT" = "ENOENT";
  }

  /** Thrown when a directory was not found. */
  export class DirectoryNotFoundError extends PathNotFoundError {
    constructor(dirPath: StandardizedFilePath) {
      super(dirPath, "Directory");
    }
  }

  /** Thrown when a file was not found. */
  export class FileNotFoundError extends PathNotFoundError {
    constructor(filePath: StandardizedFilePath) {
      super(filePath, "File");
    }
  }

  /** Thrown when an action was taken that is not allowed. */
  export class InvalidOperationError extends BaseError {
    constructor(message: string, node?: Node) {
      super(message, node);
    }
  }

  /** Thrown when a certain behaviour or feature has not been implemented. */
  export class NotImplementedError extends BaseError {
    constructor(message = "Not implemented.", node?: Node) {
      super(message, node);
    }
  }

  /** Thrown when an operation is not supported. */
  export class NotSupportedError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }

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
  export function throwIfWhitespaceOrNotString(value: string, argName: string) {
    throwIfNotString(value, argName);
    if (value.trim().length === 0)
      throw new ArgumentNullOrWhitespaceError(argName);
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
  export function throwNotImplementedForSyntaxKindError(kind: ts.SyntaxKind, node?: Node): never {
    throw new NotImplementedError(`Not implemented feature for syntax kind '${getSyntaxKindName(kind)}'.`, node);
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
  export function throwIfNullOrUndefined<T>(value: T | undefined, errorMessage: string | (() => string), node?: Node): T {
    if (value == null)
      throw new InvalidOperationError(typeof errorMessage === "string" ? errorMessage : errorMessage(), node);
    return value;
  }

  /**
   * Throw if the value should have been the never type.
   * @param value - Value to check.
   */
  export function throwNotImplementedForNeverValueError(value: never, sourceNode?: Node): never {
    const node = value as any as { kind: number };
    if (node != null && typeof node.kind === "number")
      return throwNotImplementedForSyntaxKindError(node.kind, sourceNode);

    throw new NotImplementedError(`Not implemented value: ${JSON.stringify(value)}`, sourceNode);
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
}

/**
 * Returns the line of the given node inside its source file
 * in a prettified format.
 */
function getPrettyNodeLocation(node: errors.Node) {
  const source = getSourceLocation(node);
  if (!source)
    return undefined;
  return `${source.filePath}:${source.loc.line}:${source.loc.character}\n`
    + `> ${source.loc.line} | ${source.lineText}`;
}

/**
 * Returns the location of the given node inside its source file.
 */
function getSourceLocation(node: errors.Node) {
  if (!isNode(node))
    return;
  const sourceFile = node.getSourceFile();
  const sourceCode = sourceFile.getFullText();
  const start = node.getStart();
  const lineStart = sourceCode.lastIndexOf("\n", start) + 1;
  const nextNewLinePos = sourceCode.indexOf("\n", start);
  const lineEnd = nextNewLinePos === -1 ? sourceCode.length : nextNewLinePos;
  const textStart = (start - lineStart > 40) ? start - 37 : lineStart;
  const textEnd = (lineEnd - textStart > 80) ? textStart + 77 : lineEnd;
  let lineText = "";
  if (textStart !== lineStart)
    lineText += "...";
  lineText += sourceCode.substring(textStart, textEnd);
  if (textEnd !== lineEnd)
    lineText += "...";

  return {
    filePath: sourceFile.getFilePath(),
    loc: {
      line: StringUtils.getLineNumberAtPos(sourceCode, start),
      character: start - lineStart + 1, // make 1-indexed
    },
    lineText,
  };
}

function isNode(node: unknown): node is errors.Node {
  return typeof node === "object" && node !== null && ("getSourceFile" in node) && ("getStart" in node);
}
