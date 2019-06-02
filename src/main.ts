/// <reference path="typings/index.d.ts" />
export * from "./codeBlockWriter";
export * from "./compiler";
export * from "./errors/classes";
export { Directory, DirectoryAddOptions, DirectoryCopyOptions, DirectoryEmitResult, DirectoryMoveOptions, FileSystemHost } from "./fileSystem";
export * from "./options";
export { ProjectOptions, Project, SourceFileCreateOptions } from "./Project";
export * from "./structures";
export { Constructor, WriterFunction } from "./types";
export { createWrappedNode, CreateWrappedNodeOptions } from "./utils/compiler/createWrappedNode";
export { printNode, PrintNodeOptions } from "./utils/compiler/printNode";
export { SourceFileReferencingNodes } from "./utils/references/SourceFileReferenceContainer";
export { CompilerOptionsFromTsConfigOptions, CompilerOptionsFromTsConfigResult, getCompilerOptionsFromTsConfig } from "./utils/tsconfig/getCompilerOptionsFromTsConfig";
export { TypeGuards } from "./utils";
import { Writers } from "./structurePrinters/Writers";
/** @deprecated Use `Writers`. */
const WriterFunctions = Writers;
export { Writers };
export { WriterFunctions };
export { WriterFunctionOrValue } from "./structurePrinters/Writers";
export * from "./typescript/public";
