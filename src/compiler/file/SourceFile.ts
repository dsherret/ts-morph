import * as ts from "typescript";
import * as path from "path";
import {Node} from "./../common";
import {StatementedNode} from "./../statement";

export const SourceFileBase = StatementedNode(Node);
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    getFileName() {
        return this.node.fileName;
    }

    getReferencedFiles() {
        const dirName = path.dirname(this.getFileName());
        return (this.node.referencedFiles || []).map(f => this.factory.getSourceFileFromFilePath(path.join(dirName, f.fileName)));
    }

    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile() {
        return this.node.isDeclarationFile;
    }

    /**
     * Inserts text at a given position. Will reconstruct the underlying source file.
     * @internal
     * @param insertPos - Insert position.
     * @param newText - Text to insert.
     */
    insertText(insertPos: number, newText: string) {
        const currentText = this.getFullText();
        const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
        const tempSourceFile = this.factory.createTempSourceFileFromText(newFileText, this.getFileName());

        this.replaceNodesFromNewSourceFile(insertPos, insertPos + newText.length, newText.length, tempSourceFile, []);
        return this;
    }

    /**
     * Nodes to remove (they must be contiguous in their positions).
     * @internal
     * @param nodes - Nodes to remove.
     */
    removeNodes(...nodes: (Node<ts.Node> | undefined)[]) {
        const nonNullNodes = nodes.filter(n => n != null) as Node<ts.Node>[];
        if (nonNullNodes.length === 0)
            return this;

        this.ensureNodePositionsContiguous(nonNullNodes);
        const removeRangeStart = nonNullNodes[0].getPos();
        const removeRangeEnd = nonNullNodes[nonNullNodes.length - 1].getEnd();
        const currentText = this.getFullText();
        const newFileText = currentText.substring(0, removeRangeStart) + currentText.substring(removeRangeEnd);
        const tempSourceFile = this.factory.createTempSourceFileFromText(newFileText, this.getFileName());

        this.replaceNodesFromNewSourceFile(removeRangeStart, removeRangeStart, removeRangeStart - removeRangeEnd, tempSourceFile, nonNullNodes);
        return this;
    }

    /**
     * @internal
     * @param rangeStart
     * @param rangeEnd
     * @param differenceLength
     * @param tempSourceFile
     * @param nodesBeingRemoved
     */
    replaceNodesFromNewSourceFile(rangeStart: number, rangeEnd: number, differenceLength: number, tempSourceFile: SourceFile, nodesBeingRemoved: Node<ts.Node>[]) {
        // todo: clean up this method... this is quite awful
        const sourceFile = this;
        // temp solution
        function* wrapper() {
            for (let value of Array.from(sourceFile.getAllChildren()).map(t => t.getCompilerNode())) {
                yield value;
            }
        }

        const allNodesBeingRemoved = [...nodesBeingRemoved];
        nodesBeingRemoved.forEach(n => {
            allNodesBeingRemoved.push(...Array.from(n.getAllChildren()));
        });
        const compilerNodesBeingRemoved = allNodesBeingRemoved.map(n => n.getCompilerNode());

        const currentFileChildIterator = wrapper();
        const tempFileChildIterator = tempSourceFile.getAllChildren(tempSourceFile);
        let currentChild = currentFileChildIterator.next().value;
        let hasPassed = false;

        for (let newChild of tempFileChildIterator) {
            const newChildPos = newChild.getPos();
            const newChildStart = newChild.getStart();

            while (compilerNodesBeingRemoved.indexOf(currentChild) >= 0) {
                currentChild = currentFileChildIterator.next().value;
                hasPassed = true;
            }

            if (newChildPos <= rangeStart && !hasPassed) {
                if (newChild.getKind() !== currentChild.kind) {
                    hasPassed = true;
                    continue;
                }

                if (currentChild.pos !== newChild.getPos()) {
                    throw new Error(`Unexpected! Perhaps a syntax error was inserted (${ts.SyntaxKind[currentChild.kind]}:${newChild.getKindName()}).`);
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
            else if (newChildStart >= rangeEnd) {
                const adjustedPos = newChildStart - differenceLength;

                if (currentChild.getStart() !== adjustedPos || currentChild.kind !== newChild.getKind()) {
                    throw new Error(`Unexpected! Perhaps a syntax error was inserted (${ts.SyntaxKind[currentChild.kind]}:${newChild.getKindName()}).`);
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
        }

        this.factory.replaceCompilerNode(sourceFile, tempSourceFile.getCompilerNode());

        for (let nodeBeingRemoved of allNodesBeingRemoved) {
            this.factory.removeNodeFromCache(nodeBeingRemoved);
        }
    }

    /**
     * Ensures the node positions are contiguous
     * @internal
     * @param nodes - Nodes to check.
     */
    ensureNodePositionsContiguous(nodes: Node<ts.Node>[]) {
        let lastPosition = nodes[0].getPos();
        for (let node of nodes) {
            if (node.getPos() !== lastPosition)
                throw new Error("Node to remove must be contiguous.");
            lastPosition = node.getEnd();
        }
    }

    /**
     * Replaces text in a source file. Good for renaming identifiers. Not good for creating new nodes!
     * @internal
     * @param replaceStart - Start of where to replace.
     * @param replaceEnd - End of where to replace.
     * @param newText - The new text to go in place.
     */
    replaceText(replaceStart: number, replaceEnd: number, newText: string) {
        const difference = newText.length - (replaceEnd - replaceStart);
        const sourceFile = this;

        replaceForNode(this);

        function replaceForNode(node: Node<ts.Node>) {
            const currentStart = node.getStart(sourceFile);
            const compilerNode = node.getCompilerNode();

            // do the children first so that the underlying _children array is filled in based on the source file
            for (let child of node.getChildren(sourceFile)) {
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
}
