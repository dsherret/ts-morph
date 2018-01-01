import * as ts from "typescript";
import {Node, SourceFile} from "./../../compiler";
import {Logger, TypeGuards} from "./../../utils";
import {doManipulation} from "./../doManipulation";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {InsertionTextManipulator} from "./../textManipulators";

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
