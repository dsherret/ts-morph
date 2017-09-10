import * as ts from "typescript";
import {Node, SourceFile} from "./../compiler";

/**
 * Replaces text in a source file. Good for renaming identifiers. Not good for creating new nodes!
 * @param sourceFile - Source file to replace in.
 * @param replaceStart - Start of where to replace.
 * @param replaceEnd - End of where to replace.
 * @param newText - The new text to go in place.
 */
export function replaceNodeText(sourceFile: SourceFile, replaceStart: number, replaceEnd: number, newText: string) {
    const difference = newText.length - (replaceEnd - replaceStart);

    replaceForNode(sourceFile);
    sourceFile.global.resetProgram();
    sourceFile.setIsSaved(false);

    function replaceForNode(node: Node) {
        const currentStart = node.getStart();
        const compilerNode = node.compilerNode;

        // do the children first so that the underlying _children array is filled in based on the source file
        for (const child of node.getChildren()) {
            replaceForNode(child);
        }

        if (node.containsRange(replaceStart, replaceEnd)) {
            const text = (compilerNode as any).text as string | undefined;
            if (text != null) {
                const relativeStart = replaceStart - currentStart;
                const relativeEnd = replaceEnd - currentStart;
                const newNodeText = text.substring(0, relativeStart) + newText + text.substring(relativeEnd);
                if (compilerNode.kind === ts.SyntaxKind.SourceFile)
                    (compilerNode as any).text = newNodeText;
                else
                    (compilerNode as any).escapedText = newNodeText;
            }
            compilerNode.end += difference;
        }
        else if (currentStart > replaceStart) {
            compilerNode.pos += difference;
            compilerNode.end += difference;
        }
    }
}
