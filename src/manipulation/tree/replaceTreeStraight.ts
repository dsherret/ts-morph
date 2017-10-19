import {SourceFile} from "./../../compiler";
import {StraightReplacementNodeHandler} from "./nodeHandlers";

/**
 * Replaces two trees that should be identical other than positions.
 * @param currentSourceFile - Current source file.
 * @param replacementSourceFile - Replacement source file.
 */
export function replaceTreeStraight(currentSourceFile: SourceFile, replacementSourceFile: SourceFile) {
    const straightReplacementNodeHandler = new StraightReplacementNodeHandler(currentSourceFile.global.compilerFactory);
    straightReplacementNodeHandler.handleNode(currentSourceFile, replacementSourceFile);
}
