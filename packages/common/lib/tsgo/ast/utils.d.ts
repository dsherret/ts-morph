import { SyntaxKind } from "../enums/syntaxKind.enum";
import type { __String, HasExpression, HasInitializer, ObjectAssignmentInitializer, SourceFile } from "./ast";
import type { Node } from "./ast";
export declare function formatSyntaxKind(kind: SyntaxKind): string;
/**
 * Remove one extra leading underscore from an identifier name, recovering the
 * display form from its escaped {@link __String} key.
 */
export declare function unescapeLeadingUnderscores(identifier: __String): string;
/**
 * Add an extra leading underscore to a display name that already begins with
 * `__`, producing its escaped {@link __String} key.
 */
export declare function escapeLeadingUnderscores(identifier: string): __String;
export declare function tryCast<TOut extends TIn, TIn = any>(value: TIn | undefined, test: (value: TIn) => value is TOut): TOut | undefined;
export declare function cast<TOut extends TIn, TIn = any>(value: TIn | undefined, test: (value: TIn) => value is TOut): TOut;
export declare function hasExpression(node: Node): node is HasExpression;
export declare function hasInitializer(node: Node): node is HasInitializer;
export declare function hasObjectAssignmentInitializer(node: Node): node is ObjectAssignmentInitializer;
export declare function cloneSourceFileData(sourceFile: SourceFile): Record<string, unknown>;
