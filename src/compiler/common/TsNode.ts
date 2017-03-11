import * as ts from "typescript";
import {Memoize, ArrayUtils} from "./../../utils";
import {CompilerFactory} from "./../../factories";
import {TsSourceFile} from "./../file";
import {syntaxKindToName} from "./../utils";

export class TsNode<NodeType extends ts.Node> {
    constructor(
        protected readonly factory: CompilerFactory,
        protected node: NodeType
    ) {
    }

    getCompilerNode() {
        return this.node;
    }

    containsChildBasedOnPosition(child: TsNode<ts.Node>) {
        return this.containsRange(child.getStartPosition(), child.getEndPosition());
    }

    containsRange(startPosition: number, endPosition: number) {
        return this.getStartPosition() <= startPosition && endPosition <= this.getEndPosition();
    }

    addChild(child: TsNode<ts.Node>) {
        this.ensureLastChildTextNewLine();
        const sourceFile = this.getRequiredSourceFile();
        const text = child.getFullText();
        child.detatchParent();
        child.offsetPositions(this.node.end);
        child.node.parent = this.node;
        /*child.node.pos = this.node.end;
        child.node.end = child.node.pos + text.length;*/
        sourceFile.replaceText(this.node.end, this.node.end, text);

        const children = (this.node as any)._children as ts.Node[];
        if (children != null)
            children.push(child.node);
        const statements = (this.node as any).statements as ts.Node[] | null;
        if (statements != null)
            statements.push(child.node);

        if (this.isSourceFile())
            this.ensureLastChildTextNewLine();
    }

    detatchParent() {
        const parent = this.getParent();
        if (parent == null)
            return;

        const length = this.node.end - this.node.pos;
        parent.removeChild(this);
        this.node.pos = 0;
        this.node.end = length;
        this.node.parent = undefined;
    }

    removeChild(childToRemove: TsNode<ts.Node>) {
        const tsSourceFile = this.getRequiredSourceFile();
        function removeChildFrom(node: TsNode<ts.Node>) {
            for (let child of node.getChildren()) {
                if (childToRemove === child) {
                    const children = (node.node as any)._children as ts.Node[];
                    if (children != null)
                        ArrayUtils.removeFirst(children, childToRemove.node);
                    const statements = (node.node as any).statements as ts.Node[];
                    if (statements != null)
                        ArrayUtils.removeFirst(statements, childToRemove.node);
                    return;
                }

                if (child.containsChildBasedOnPosition(childToRemove))
                    removeChildFrom(child);
            }
        }

        removeChildFrom(this);

        const pos = childToRemove.node.pos;
        const end = childToRemove.node.end;
        tsSourceFile.replaceText(pos, end, "");
    }

    replaceText(replaceStart: number, replaceEnd: number, newText: string) {
        // todo: optimize
        const currentStart = this.node.pos;
        const difference = newText.length - (replaceEnd - replaceStart);

        if (this.containsRange(replaceStart, replaceEnd)) {
            const text = (this.node as any).text as string | undefined;
            if (text != null) {
                const relativeStart = replaceStart - currentStart;
                const relativeEnd = replaceEnd - currentStart;
                (this.node as any).text = text.substring(0, relativeStart) + newText + text.substring(relativeEnd);
            }
            this.node.end += difference;
        }
        else if (currentStart > replaceStart) {
            this.node.pos += difference;
            this.node.end += difference;
        }

        for (let child of this.getChildren()) {
            child.replaceText(replaceStart, replaceEnd, newText);
        }
    }

    offsetPositions(offset: number) {
        this.node.pos += offset;
        this.node.end += offset;

        for (let child of this.getChildren()) {
            child.offsetPositions(offset);
        }
    }

    *getChildrenAfter(tsNode: TsNode<ts.Node>) {
        // todo: optimize
        let foundChild = false;

        for (let child of this.getChildren()) {
            if (!foundChild) {
                foundChild = child === tsNode;
                continue;
            }

            yield child;
        }
    }

    *getChildren() {
        for (let child of this.node.getChildren()) {
            yield this.factory.getTsNodeFromNode(child);
        }
    }

    getMainChildren() {
        const childNodes: TsNode<ts.Node>[] = [];
        ts.forEachChild(this.node, childNode => {
            childNodes.push(this.factory.getTsNodeFromNode(childNode));
        });
        return childNodes;
    }

    *getAllChildren(): IterableIterator<TsNode<ts.Node>> {
        for (let child of this.getChildren()) {
            for (let childChild of child.getAllChildren()) {
                yield childChild;
            }
        }
    }

    getStartPosition() {
        return this.node.pos;
    }

    getEndPosition() {
        return this.node.end;
    }

    getFullText(tsSourceFile?: TsSourceFile) {
        if (tsSourceFile != null)
            return this.node.getFullText(tsSourceFile.node);
        else
            return this.node.getFullText();
    }

    replaceCompilerNode(node: NodeType) {
        this.node = node;
    }

    getRequiredSourceFile() {
        const sourceFile = this.getSourceFile();
        if (sourceFile == null)
            throw new Error("A source file or source file parent is required to do this operation.");
        return sourceFile;
    }

    getSourceFile(): TsSourceFile | null {
        const topParent = this.getTopParent();
        return (topParent != null && topParent.isSourceFile() ? topParent : null) as TsSourceFile | null;
    }

    *getAllParents() {
        let parent = this.getParent();
        while (parent != null) {
            yield parent;
            parent = parent.getParent();
        }
    }

    getTopParent() {
        let parent = this as TsNode<ts.Node>;
        let nextParent = parent!.getParent();
        while (nextParent != null) {
            parent = nextParent;
            nextParent = parent!.getParent();
        }

        return parent;
    }

    getParent() {
        return (this.node.parent == null) ? null : this.factory.getTsNodeFromNode(this.node.parent);
    }

    ensureLastChildTextNewLine() {
        if (!this.isLastChildTextNewLine())
            this.appendChildNewLine();
    }

    isLastChildTextNewLine() {
        const sourceFile = this.getRequiredSourceFile();
        const text = this.getFullText(sourceFile);
        const newLineChar = this.factory.getLanguageService().getNewLine();
        if (this.isSourceFile())
            return text.endsWith(newLineChar);
        else
            throw this.getNotImplementedError();
    }

    appendChildNewLine() {
        this.appendChildText(this.factory.getLanguageService().getNewLine());
    }

    appendChildText(text: string) {
        if (this.isSourceFile()) {
            const sourceFile = this as TsSourceFile;
            sourceFile.node.text += text;
            sourceFile.node.end += text.length;
        }
        else {
            throw this.getNotImplementedError();
        }
    }

    /**
     * On ts.Node objects there is a _children array that's used in various methods on the node.
     * It's useful to fill this in certain circumstances.
     */
    fillUnderlyingChildrenArrays() {
        function fillChildren(declaration: ts.Node) {
            // calling getChildren() will fill the underlying _children array
            for (let child of declaration.getChildren())
                fillChildren(child);
        }
        fillChildren(this.node);
    }

    /**
     * On ts.Node objects there is a _children array. It's useful to clear this for when it needs to be repopulated.
     */
    resetUnderlyingChildrenArrays() {
        function clearChildren(declaration: ts.Node) {
            for (let child of declaration.getChildren())
                clearChildren(child);

            (declaration as any)._children = undefined;
        }

        clearChildren(this.node);
    }

    isSourceFile() : this is TsSourceFile {
        return false;
    }

    getNotImplementedError() {
        return new Error(this.getNotImplementedMessage());
    }

    getNotImplementedMessage() {
        return `Not implemented feature for syntax kind '${this.getSyntaxKindName()}'.`;
    }

    getSyntaxKindName() {
        return syntaxKindToName(this.node.kind);
    }

    /**
     * Gets the indentation text.
     * @param tsSourceFile - Optional source file.
     */
    getIndentationText(tsSourceFile = this.getRequiredSourceFile()) {
        const sourceFileText = tsSourceFile.getFullText();
        const startLinePos = this.getStartLinePos(tsSourceFile);
        const startPosWithoutTrivia = this.getPosWithoutTrivia(tsSourceFile);
        let text = "";

        for (let i = startPosWithoutTrivia - 1; i >= startLinePos; i--) {
            const currentChar = sourceFileText[i];
            switch (currentChar) {
                case " ":
                case "\t":
                    text = currentChar + text;
                    break;
                case "\n":
                    return text;
                default:
                    text = "";
            }
        }

        return text;
    }

    /**
     * Gets the position of the start of the line that this node is on.
     * @param tsSourceFile - Optional source file.
     */
    getStartLinePos(tsSourceFile = this.getRequiredSourceFile()) {
        const sourceFileText = tsSourceFile.getFullText();
        const startPos = this.getPosWithoutTrivia();

        for (let i = startPos - 1; i >= 0; i--) {
            const currentChar = sourceFileText.substr(i, 1);
            if (currentChar === "\n")
                return i + 1;
        }

        return 0;
    }

    /**
     * Gets the node.pos + leading trivia width.
     * @param tsSourceFile - Optional source file.
     */
    getPosWithoutTrivia(tsSourceFile = this.getRequiredSourceFile()) {
        const leadingTriviaWidth = this.node.getLeadingTriviaWidth(tsSourceFile.getCompilerNode());
        return this.node.pos + leadingTriviaWidth;
    }
}
