/// <reference path="typings/index.d.ts" />
import * as ts from "typescript";
export * from "./codeBlockWriter";
export * from "./compiler";
export * from "./errors/classes";
export { Directory, DirectoryAddOptions, DirectoryCopyOptions, DirectoryEmitResult, DirectoryMoveOptions, FileSystemHost } from "./fileSystem";
export * from "./options";
export { Options, Project, SourceFileCreateOptions } from "./Project";
export { Project as default } from "./Project";
export * from "./structures";
export { Constructor, WriterFunction } from "./types";
export { createWrappedNode, CreateWrappedNodeOptions } from "./utils/compiler/createWrappedNode";
export { printNode, PrintNodeOptions } from "./utils/compiler/printNode";
export { SourceFileReferencingNodes } from "./utils/references/SourceFileReferenceContainer";
export { CompilerOptionsFromTsConfigOptions, CompilerOptionsFromTsConfigResult, getCompilerOptionsFromTsConfig } from "./utils/tsconfig/getCompilerOptionsFromTsConfig";
export { TypeGuards } from "./utils/TypeGuards";
// export typescript declarations
export * from "./typescript/public";
export { ts };
