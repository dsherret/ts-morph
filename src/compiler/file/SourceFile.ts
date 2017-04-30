import * as ts from "typescript";
import {Node, Symbol} from "./../common";
import {StatementedNode} from "./../statement";
import {TypeChecker} from "./../tools";
import {FileUtils} from "./../../utils";

export const SourceFileBase = StatementedNode(Node);
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    /**
     * Gets the file path.
     */
    getFilePath() {
        return this.node.fileName;
    }

    /**
     * Copy this source file to a new file.
     * @param filePath - A new file path. Can be relative to the original file or an absolute path.
     */
    copy(filePath: string): SourceFile {
        const absoluteFilePath = FileUtils.getAbsoluteOrRelativePathFromPath(filePath, FileUtils.getDirName(this.getFilePath()));
        return this.factory.addSourceFileFromText(absoluteFilePath, this.getFullText());
    }

    /**
     * Asynchronously saves this file with any changes.
     */
    save(callback?: (err: NodeJS.ErrnoException) => void) {
        // todo: use a promise
        this.factory.getFileSystemHost().writeFile(this.getFilePath(), this.getFullText(), callback);
    }

    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        this.factory.getFileSystemHost().writeFileSync(this.getFilePath(), this.getFullText());
    }

    /**
     * Gets any referenced files.
     */
    getReferencedFiles() {
        const dirName = FileUtils.getDirName(this.getFilePath());
        return (this.node.referencedFiles || []).map(f => this.factory.getSourceFileFromFilePath(FileUtils.pathJoin(dirName, f.fileName)));
    }

    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile() {
        return this.node.isDeclarationFile;
    }

    /**
     * Gets the default export symbol of the file.
     * @param typeChecker - Type checker.
     */
    getDefaultExportSymbol(typeChecker: TypeChecker = this.factory.getTypeChecker()): Symbol | undefined {
        const sourceFileSymbol = typeChecker.getSymbolAtLocation(this.getRequiredSourceFile());

        // will be undefined when the source file doesn't have an export
        if (sourceFileSymbol == null)
            return undefined;

        return sourceFileSymbol.getExportByName("default");
    }

    /**
     * Removes any "export default";
     */
    removeDefaultExport(typeChecker?: TypeChecker, defaultExportSymbol?: Symbol | undefined): this {
        typeChecker = typeChecker || this.factory.getTypeChecker();
        defaultExportSymbol = defaultExportSymbol || this.getDefaultExportSymbol(typeChecker);

        if (defaultExportSymbol == null)
            return this;

        const declaration = defaultExportSymbol.getDeclarations()[0];
        if (declaration.node.kind === ts.SyntaxKind.ExportAssignment)
            this.removeNodes(declaration);
        else if (declaration.isModifierableNode()) {
            const exportKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
            const defaultKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.DefaultKeyword);
            this.removeNodes(exportKeyword, defaultKeyword);
        }

        return this;
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
        const tempSourceFile = this.factory.createTempSourceFileFromText(newFileText, this.getFilePath());

        this.replaceNodesFromNewSourceFile(insertPos, insertPos + newText.length, newText.length, tempSourceFile, []);
        return this;
    }

    /**
     * Nodes to remove (they must be contiguous in their positions).
     * @internal
     * @param nodes - Nodes to remove.
     */
    removeNodes(...nodes: (Node | undefined)[]) {
        return this.removeNodesWithOptions(nodes, {});
    }

    /**
     * Nodes to remove (they must be contiguous in their positions).
     * @internal
     * @param nodes - Nodes to remove.
     * @param Opts - Options for removal.
     */
    removeNodesWithOptions(nodes: (Node | undefined)[], opts: { removePrecedingSpaces?: boolean; }) {
        const nonNullNodes = nodes.filter(n => n != null) as Node[];
        if (nonNullNodes.length === 0 || nonNullNodes[0].getPos() === nonNullNodes[nonNullNodes.length - 1].getEnd())
            return this;

        this.ensureNodePositionsContiguous(nonNullNodes);

        // get the start and end position
        const {removePrecedingSpaces = true} = opts;
        const parentStart = nonNullNodes[0].getRequiredParent().getStart();
        const nodeStart = nonNullNodes[0].getStart();
        const currentText = this.getFullText();
        const removeRangeStart = removePrecedingSpaces ? Math.max(parentStart, nonNullNodes[0].getPos()) : nonNullNodes[0].getStart();
        let removeRangeEnd = nonNullNodes[nonNullNodes.length - 1].getEnd();

        // trim any end spaces when the current node is the first node of the parent
        const isFirstNodeOfParent = nodeStart === parentStart;
        if (isFirstNodeOfParent) {
            const whitespaceRegex = /[^\S\r\n]/;
            while (whitespaceRegex.test(currentText[removeRangeEnd]))
                removeRangeEnd++;
        }

        // remove the nodes
        const newFileText = currentText.substring(0, removeRangeStart) + currentText.substring(removeRangeEnd);
        const tempSourceFile = this.factory.createTempSourceFileFromText(newFileText, this.getFilePath());

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
    replaceNodesFromNewSourceFile(rangeStart: number, rangeEnd: number, differenceLength: number, tempSourceFile: SourceFile, nodesBeingRemoved: Node[]) {
        // todo: clean up this method... this is quite awful
        const sourceFile = this;
        // temp solution
        function* wrapper() {
            for (const value of Array.from(sourceFile.getAllChildren()).map(t => t.getCompilerNode())) {
                yield value;
            }
        }
        function getErrorMessageText(currentChild: ts.Node, newChild: Node) {
            let text = `Unexpected! Perhaps a syntax error was inserted (${ts.SyntaxKind[currentChild.kind]}:${newChild.getKindName()}).\n\nCode:\n`;
            const sourceFileText = tempSourceFile.getFullText();
            const startPos = sourceFileText.lastIndexOf("\n", newChild.getPos()) + 1;
            let endPos = sourceFileText.indexOf("\n", newChild.getEnd());
            if (endPos === -1)
                endPos = sourceFileText.length;
            text += sourceFileText.substring(startPos, endPos);
            return text;
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

        for (const newChild of tempFileChildIterator) {
            const newChildPos = newChild.getPos();
            const newChildStart = newChild.getStart();
            const isSyntaxListDisappearing = () => currentChild.kind === ts.SyntaxKind.SyntaxList && currentChild.kind !== newChild.getKind();
            const isTypeReferenceDisappearing = () => currentChild.kind === ts.SyntaxKind.TypeReference && newChild.getKind() === ts.SyntaxKind.FirstAssignment;

            while (compilerNodesBeingRemoved.indexOf(currentChild) >= 0 || isSyntaxListDisappearing() || isTypeReferenceDisappearing()) {
                if (isTypeReferenceDisappearing()) {
                    // skip all the children of this node
                    const parentEnd = currentChild.getEnd();
                    do {
                        currentChild = currentFileChildIterator.next().value;
                    } while (currentChild != null && currentChild.getEnd() <= parentEnd);
                }
                else
                    currentChild = currentFileChildIterator.next().value;

                hasPassed = true;
            }

            if (newChildPos <= rangeStart && !hasPassed) {
                if (newChild.getKind() !== currentChild.kind) {
                    hasPassed = true;
                    continue;
                }

                if (currentChild.pos !== newChild.getPos()) {
                    if (newChildPos === newChild.getEnd())
                        continue;
                    throw new Error(getErrorMessageText(currentChild, newChild));
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
            else if (newChildStart >= rangeEnd) {
                const adjustedPos = newChildStart - differenceLength;

                if (currentChild.getStart() !== adjustedPos || currentChild.kind !== newChild.getKind()) {
                    if (newChildPos === newChild.getEnd())
                        continue;
                    throw new Error(getErrorMessageText(currentChild, newChild));
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
        }

        this.factory.replaceCompilerNode(sourceFile, tempSourceFile.getCompilerNode());

        for (const nodeBeingRemoved of allNodesBeingRemoved)
            this.factory.removeNodeFromCache(nodeBeingRemoved);
    }

    /**
     * Ensures the node positions are contiguous
     * @internal
     * @param nodes - Nodes to check.
     */
    ensureNodePositionsContiguous(nodes: Node[]) {
        let lastPosition = nodes[0].getPos();
        for (const node of nodes) {
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

        function replaceForNode(node: Node) {
            const currentStart = node.getStart(sourceFile);
            const compilerNode = node.getCompilerNode();

            // do the children first so that the underlying _children array is filled in based on the source file
            for (const child of node.getChildren(sourceFile)) {
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
