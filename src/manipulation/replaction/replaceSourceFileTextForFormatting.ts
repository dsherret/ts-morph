import * as ts from "typescript";
import {SourceFile} from "./../../compiler";
import {doManipulation} from "./../doManipulation";
import {FullReplacementTextManipulator} from "./../textManipulators";
import {NodeHandlerFactory} from "./../nodeHandlers";

/**
 * Replaces the text in a source file and assumes only the nodes will shift (no tree structure should change).
 *
 * This is very useful when making formatting changes that won't change the AST structure.
 */
export function replaceSourceFileTextForFormatting(opts: { sourceFile: SourceFile; newText: string; }) {
    const {sourceFile, newText} = opts;
    doManipulation(sourceFile,
        new FullReplacementTextManipulator(newText),
        new NodeHandlerFactory().getForStraightReplacement(sourceFile.global.compilerFactory));
}
