import * as ts from "typescript";
import {Node, SourceFile, RenameLocation} from "./../../compiler";
import {TypeGuards} from "./../../utils";
import {doManipulation} from "./doManipulation";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {InsertionTextManipulator, FullReplacementTextManipulator, RenameLocationTextManipulator} from "./../textManipulators";

/**
 * Replaces text in a source file. Will forget any changed nodes.
 * @param sourceFile - Source file to replace in.
 * @param replaceStart - Start of where to replace.
 * @param replaceEnd - End of where to replace.
 * @param newText - The new text to go in place.
 */
export function replaceNodeText(sourceFile: SourceFile, replaceStart: number, replaceEnd: number, newText: string) {
    doManipulation(sourceFile,
        new InsertionTextManipulator({
            insertPos: replaceStart,
            newText,
            replacingLength: replaceEnd - replaceStart
        }),
        new NodeHandlerFactory().getForForgetChanged(sourceFile.global.compilerFactory));
}

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

/**
 * Replaces the text in a source file based on rename locations.
 */
export function replaceSourceFileTextForRename(opts: { sourceFile: SourceFile; renameLocations: RenameLocation[]; newName: string; }) {
    const {sourceFile, renameLocations, newName} = opts;
    const nodeHandlerFactory = new NodeHandlerFactory();

    doManipulation(sourceFile,
        new RenameLocationTextManipulator(renameLocations, newName),
        nodeHandlerFactory.getForTryOrForget(nodeHandlerFactory.getForForgetChanged(sourceFile.global.compilerFactory)));
}

export interface ReplaceTextPossiblyCreatingChildNodesOptions {
    replacePos: number;
    replacingLength: number;
    newText: string;
    parent: Node;
}

/**
 * Replaces a node text while possibly creating new child nodes.
 */
export function replaceTextPossiblyCreatingChildNodes(opts: ReplaceTextPossiblyCreatingChildNodesOptions) {
    const {replacePos, replacingLength, newText, parent} = opts;

    doManipulation(parent.sourceFile, new InsertionTextManipulator({
        insertPos: replacePos,
        replacingLength,
        newText
    }), new NodeHandlerFactory().getForRange({
        parent,
        start: replacePos,
        end: replacePos + newText.length
    }));
}
