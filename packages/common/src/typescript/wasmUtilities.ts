import { WasmNode } from './wasmNode';
import * as ts from 'typescript';

// Re-implemented entirely in JS using node.kind to prevent boundary crossings
export function isIdentifier(node: WasmNode): boolean {
    return node.kind === ts.SyntaxKind.Identifier;
}

export function isSourceFile(node: WasmNode): boolean {
    return node.kind === ts.SyntaxKind.SourceFile;
}

// Add more lightweight tree-walking utilities as needed...
