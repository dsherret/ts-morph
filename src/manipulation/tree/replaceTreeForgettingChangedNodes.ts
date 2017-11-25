import {SourceFile} from "./../../compiler";
import {ForgetChangedNodeHandler} from "./nodeHandlers";

/**
 * Replaces a tree with a new one, but will forget any nodes that have changed.
 * @param currentSourceFile - Current source file.
 * @param replacementSourceFile - Replacement source file.
 */
export function replaceTreeForgettingChangedNodes(currentSourceFile: SourceFile, replacementSourceFile: SourceFile) {
    const nodeHandler = new ForgetChangedNodeHandler(currentSourceFile.global.compilerFactory);
    nodeHandler.handleNode(currentSourceFile, replacementSourceFile);
}
