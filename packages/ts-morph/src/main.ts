/// <reference path="typings/index.d.ts" />
import { errors } from "@ts-morph/common";
export { CompilerOptions, CompilerOptionsContainer, DiagnosticCategory, EditorSettings, EmitHint, FileSystemHost, InMemoryFileSystemHost, LanguageVariant,
    ModuleKind, ModuleResolutionKind, NewLineKind, NodeFlags, ObjectFlags, ResolutionHost, ResolutionHostFactory, ScriptKind, ScriptTarget, SettingsContainer,
    SymbolFlags, SyntaxKind, ts, TypeFlags, TypeFormatFlags } from "@ts-morph/common";
export * from "./codeBlockWriter";
export * from "./compiler";
const { InvalidOperationError, FileNotFoundError, ArgumentError, ArgumentNullOrWhitespaceError, ArgumentOutOfRangeError, ArgumentTypeError, BaseError,
    DirectoryNotFoundError, NotImplementedError, NotSupportedError, PathNotFoundError } = errors;
export { ArgumentError, ArgumentNullOrWhitespaceError, ArgumentOutOfRangeError, ArgumentTypeError, BaseError, DirectoryNotFoundError, FileNotFoundError,
    InvalidOperationError, NotImplementedError, NotSupportedError, PathNotFoundError };
export { Directory, DirectoryAddOptions, DirectoryCopyOptions, DirectoryEmitResult, DirectoryMoveOptions } from "./fileSystem";
export { ManipulationError } from "./manipulation";
export * from "./options";
export { Project, ProjectOptions, SourceFileCreateOptions } from "./Project";
export * from "./structures";
export { Constructor, InstanceOf as Instance, WriterFunction } from "./types";
export { createWrappedNode, CreateWrappedNodeOptions } from "./utils/compiler/createWrappedNode";
export { printNode, PrintNodeOptions } from "./utils/compiler/printNode";
export { SourceFileReferencingNodes } from "./utils/references/SourceFileReferenceContainer";
export { CompilerOptionsFromTsConfigOptions, CompilerOptionsFromTsConfigResult,
    getCompilerOptionsFromTsConfig } from "./utils/tsconfig/getCompilerOptionsFromTsConfig";
import { Writers } from "./structurePrinters/Writers";
/** @deprecated Use `Writers`. */
const WriterFunctions = Writers;
export { Writers };
export { WriterFunctions };
export { WriterFunctionOrValue } from "./structurePrinters/Writers";

import { Node } from "./compiler";
/** @deprecated Use static methods on `Node`. */
export const TypeGuards = Node;
