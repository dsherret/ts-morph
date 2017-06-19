import {Node, SourceFile} from "./../compiler";

/**
 * Replaces text in a source file. Good for renaming identifiers. Not good for creating new nodes!
 * @internal
 * @param sourceFile - Source file to replace in.
 * @param replaceStart - Start of where to replace.
 * @param replaceEnd - End of where to replace.
 * @param newText - The new text to go in place.
 */
export function replaceNodeText(sourceFile: SourceFile, replaceStart: number, replaceEnd: number, newText: string) {
    const difference = newText.length - (replaceEnd - replaceStart);

    replaceForNode(sourceFile);

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
                (compilerNode as any).text = text.substring(0, relativeStart) + newText + text.substring(relativeEnd);
            }
            compilerNode.end += difference;
        }
        else if (currentStart > replaceStart) {
            compilerNode.pos += difference;
            compilerNode.end += difference;
        }
    }
}
