import {SourceFile} from "./../../compiler";
import {DisposeChangedNodeHandler} from "./nodeHandlers";

/**
 * Replaces a tree with a new one, but will dispose any nodes that have changed.
 * @param currentSourceFile - Current source file.
 * @param replacementSourceFile - Replacement source file.
 */
export function replaceTreeDisposingChangedNodes(currentSourceFile: SourceFile, replacementSourceFile: SourceFile) {
    const nodeHandler = new DisposeChangedNodeHandler(currentSourceFile.global.compilerFactory);
    nodeHandler.handleNode(currentSourceFile, replacementSourceFile);
}
