import { Node, RenameLocation, SourceFile } from "../../compiler";
import { NodeHandlerFactory } from "../nodeHandlers";
import { FullReplacementTextManipulator, InsertionTextManipulator, RenameLocationTextManipulator } from "../textManipulators";
import { doManipulation } from "./doManipulation";

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
        new NodeHandlerFactory().getForForgetChanged(opts.sourceFile.context.compilerFactory));
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
        new NodeHandlerFactory().getForStraightReplacement(sourceFile.context.compilerFactory));
}

/**
 * Replaces the text in a source file based on rename locations.
 */
export function replaceSourceFileTextForRename(opts: { sourceFile: SourceFile; renameLocations: RenameLocation[]; newName: string; }) {
    const {sourceFile, renameLocations, newName} = opts;
    const nodeHandlerFactory = new NodeHandlerFactory();

    doManipulation(sourceFile,
        new RenameLocationTextManipulator(renameLocations, newName),
        nodeHandlerFactory.getForTryOrForget(nodeHandlerFactory.getForForgetChanged(sourceFile.context.compilerFactory)));
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
    const replacementSourceFile = sourceFile.context.compilerFactory.createCompilerSourceFileFromText(newFilePath, sourceFile.getFullText());

    new NodeHandlerFactory().getForStraightReplacement(sourceFile.context.compilerFactory)
        .handleNode(sourceFile, replacementSourceFile, replacementSourceFile);
}

/**
 * Replaces the source file and all its descendant nodes in the cache.
 * @param sourceFile - Source file.
 */
export function replaceSourceFileForCacheUpdate(sourceFile: SourceFile) {
    replaceSourceFileForFilePathMove({ sourceFile, newFilePath: sourceFile.getFilePath() });
}
