// Wasm Types (Experimental)
export { WasmNode } from './wasmNode';
export { WasmSourceFile } from './wasmSourceFile';
export { WasmType } from './wasmType';
export { WasmSymbol } from './wasmSymbol';

import * as ts from 'typescript';
export {
  type CompilerOptions,
  DiagnosticCategory,
  type EditorSettings,
  EmitHint,
  type ImportPhaseModifierSyntaxKind,
  LanguageVariant,
  ModuleKind,
  ModuleResolutionKind,
  NewLineKind,
  NodeFlags,
  ObjectFlags,
  ScriptKind,
  ScriptTarget,
  SymbolFlags,
  SyntaxKind,
  TypeFlags,
  TypeFormatFlags,
} from "typescript";

export { ts };
