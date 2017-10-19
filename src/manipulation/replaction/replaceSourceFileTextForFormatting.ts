import * as ts from "typescript";
import {SourceFile} from "./../../compiler";
import {replaceTreeStraight} from "./../tree";

/**
 * Replaces the text in a source file and assumes only the nodes will shift (no tree structure should change).
 *
 * This is very useful when making formatting changes that won't change the AST structure.
 */
export function replaceSourceFileTextForFormatting(opts: { sourceFile: SourceFile; newText: string; }) {
    const {sourceFile, newText} = opts;
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newText, sourceFile.getFilePath());

    replaceTreeStraight(sourceFile, tempSourceFile);
}
