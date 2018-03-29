import {ts} from "../../typescript";
import {Node, SourceFile, RenameLocation} from "../../compiler";
import {TypeGuards, createCompilerSourceFile} from "../../utils";
import {doManipulation} from "./doManipulation";
import {NodeHandlerFactory} from "../nodeHandlers";
import {InsertionTextManipulator, FullReplacementTextManipulator, RenameLocationTextManipulator} from "../textManipulators";

export interface ReplaceNodeTextOptions {
    sourceFile: SourceFile;
    start: number;
    replacingLength: number;
    newText: string;
}

/**
 * Replaces text in a source file. Will forget any changed nodes.
 */
export function replaceNodeText(opts: ReplaceNodeTextOptions) {
    doManipulation(opts.sourceFile,
        new InsertionTextManipulator({
            insertPos: opts.start,
            newText: opts.newText,
            replacingLength: opts.replacingLength
        }),
        new NodeHandlerFactory().getForForgetChanged(opts.sourceFile.global.compilerFactory));
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

export interface ReplaceSourceFileForFilePathMoveOptions {
    sourceFile: SourceFile;
    newFilePath: string;
}

/**
 * Replaces a source file for a file path move.
 */
export function replaceSourceFileForFilePathMove(opts: ReplaceSourceFileForFilePathMoveOptions) {
    const {sourceFile, newFilePath} = opts;
    const replacementSourceFile = createCompilerSourceFile(newFilePath, sourceFile.getFullText(), sourceFile.getLanguageVersion());

    new NodeHandlerFactory().getForStraightReplacement(sourceFile.global.compilerFactory)
        .handleNode(sourceFile, replacementSourceFile, replacementSourceFile);
}
