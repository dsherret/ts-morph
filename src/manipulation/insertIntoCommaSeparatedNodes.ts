import {Node, SourceFile} from "./../compiler";

export function insertIntoCommaSeparatedNodes(sourceFile: SourceFile, currentNodes: Node[], index: number, code: string) {
    const nextNode = currentNodes[index];
    if (nextNode == null) {
        const previousNode = currentNodes[index - 1];
        sourceFile.insertText(previousNode.getEnd(), `, ${code}`);
    }
    else {
        sourceFile.insertText(nextNode.getStart(), `${code}, `);
    }
}
