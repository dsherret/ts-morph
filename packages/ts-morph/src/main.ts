/// <reference path="typings/index.d.ts" />
import { errors } from "@ts-morph/common";
export { FileSystemHost, ResolutionHost, ResolutionHostFactory, CompilerOptionsContainer, SettingsContainer, ts, SyntaxKind, ScriptTarget, ScriptKind,
    LanguageVariant, EmitHint, ModuleKind, ModuleResolutionKind, NewLineKind, TypeFlags, ObjectFlags, SymbolFlags, TypeFormatFlags, DiagnosticCategory,
    CompilerOptions, EditorSettings, InMemoryFileSystemHostOptions, InMemoryFileSystemHost } from "@ts-morph/common";
export * from "./codeBlockWriter";
export * from "./compiler";
const { InvalidOperationError, FileNotFoundError, ArgumentError, ArgumentNullOrWhitespaceError, ArgumentOutOfRangeError, ArgumentTypeError, BaseError,
    DirectoryNotFoundError, NotImplementedError, NotSupportedError, PathNotFoundError } = errors;
export { InvalidOperationError, FileNotFoundError, ArgumentError, ArgumentNullOrWhitespaceError, ArgumentOutOfRangeError, ArgumentTypeError, BaseError,
    DirectoryNotFoundError, NotImplementedError, NotSupportedError, PathNotFoundError };
export { Directory, DirectoryAddOptions, DirectoryCopyOptions, DirectoryEmitResult, DirectoryMoveOptions } from "./fileSystem";
export * from "./options";
export { ProjectOptions, Project, SourceFileCreateOptions } from "./Project";
export * from "./structures";
export { Constructor, WriterFunction } from "./types";
export { createWrappedNode, CreateWrappedNodeOptions } from "./utils/compiler/createWrappedNode";
export { printNode, PrintNodeOptions } from "./utils/compiler/printNode";
export { SourceFileReferencingNodes } from "./utils/references/SourceFileReferenceContainer";
export { CompilerOptionsFromTsConfigOptions, CompilerOptionsFromTsConfigResult,
    getCompilerOptionsFromTsConfig } from "./utils/tsconfig/getCompilerOptionsFromTsConfig";
export { ManipulationError } from "./manipulation";
import { Writers } from "./structurePrinters/Writers";
/** @deprecated Use `Writers`. */
const WriterFunctions = Writers;
export { Writers };
export { WriterFunctions };
export { WriterFunctionOrValue } from "./structurePrinters/Writers";

import { Node } from "./compiler";
/**
 * @deprecated Use static methods on `Node`.
 */
export const TypeGuards = Node;
