import * as ts from "typescript";
import * as errors from "./../../errors";
import {CompilerFactory} from "./../../factories";
import {SourceFile} from "./../file";

export class Node<NodeType extends ts.Node> {
    constructor(
        protected readonly factory: CompilerFactory,
        protected node: NodeType
    ) {
    }

    /**
     * Gets the underlying compiler node.
     */
    getCompilerNode() {
        return this.node;
    }

    /**
     * Gets the syntax kind.
     */
    getKind() {
        return this.node.kind;
    }

    /**
     * Gets the syntax kind name.
     */
    getKindName() {
        return ts.SyntaxKind[this.node.kind];
    }

    /**
     * If the node contains the provided range (inclusive).
     * @param pos - Start position.
     * @param end - End position.
     */
    containsRange(pos: number, end: number) {
        return this.getPos() <= pos && end <= this.getEnd();
    }

    /**
     * Gets the first child by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildByKind(kind: ts.SyntaxKind) {
        for (let child of this.getChildren()) {
            if (child.getKind() === kind)
                return child;
        }
        return undefined;
    }

    /**
     * Offset this node's positions (pos and end) and all of its children by the given offset.
     * @internal
     * @param offset - Offset.
     */
    offsetPositions(offset: number) {
        this.node.pos += offset;
        this.node.end += offset;

        for (let child of this.getChildren()) {
            child.offsetPositions(offset);
        }
    }

    getPreviousSibling() {
        let previousSibling: Node<ts.Node> | undefined;

        for (let sibling of this.getSiblingsBefore()) {
            previousSibling = sibling;
        }

        return previousSibling;
    }

    getNextSibling() {
        const nextResult = this.getSiblingsAfter().next();
        return nextResult.done ? undefined : nextResult.value;
    }

    *getSiblingsBefore() {
        const parent = this.getParent();

        if (parent == null)
            return;

        for (let child of parent.getChildrenWithFlattenedSyntaxList()) {
            if (child === this)
                return;

            yield child;
        }
    }

    *getSiblingsAfter() {
        // todo: optimize
        let foundChild = false;
        const parent = this.getParent();

        if (parent == null)
            return;

        for (let child of parent.getChildrenWithFlattenedSyntaxList()) {
            if (!foundChild) {
                foundChild = child === this;
                continue;
            }

            yield child;
        }
    }

    *getChildren(sourceFile = this.getRequiredSourceFile()): IterableIterator<Node<ts.Node>> {
        for (let compilerChild of this.node.getChildren(sourceFile.getCompilerNode())) {
            yield this.factory.getNodeFromCompilerNode(compilerChild);
        }
    }

    // todo: make this a flags enum option for getChildren
    *getChildrenWithFlattenedSyntaxList(): IterableIterator<Node<ts.Node>> {
        for (let compilerChild of this.node.getChildren()) {
            let child = this.factory.getNodeFromCompilerNode(compilerChild);

            // flatten out syntax list
            if (child.getKind() === ts.SyntaxKind.SyntaxList) {
                for (let syntaxChild of child.getChildrenWithFlattenedSyntaxList()) {
                    yield syntaxChild;
                }
            }
            else {
                yield child;
            }
        }
    }

    getMainChildren() {
        const childNodes: Node<ts.Node>[] = [];
        ts.forEachChild(this.node, childNode => {
            childNodes.push(this.factory.getNodeFromCompilerNode(childNode));
        });
        return childNodes;
    }

    *getAllChildren(sourceFile = this.getRequiredSourceFile()): IterableIterator<Node<ts.Node>> {
        for (let compilerChild of this.node.getChildren(sourceFile.getCompilerNode())) {
            let child = this.factory.getNodeFromCompilerNode(compilerChild);
            yield child;

            for (let childChild of child.getAllChildren(sourceFile))
                yield childChild;
        }
    }

    getPos() {
        return this.node.pos;
    }

    getEnd() {
        return this.node.end;
    }

    /**
     * Gets the text without leading trivia.
     * @param sourceFile - Optional source file to help improve performance.
     */
    getText(sourceFile?: SourceFile) {
        return this.node.getText(Node.getCompilerSourceFile(sourceFile));
    }

    /**
     * Gets the full text with leading trivia.
     * @param sourceFile - Optional source file to help improve performance.
     */
    getFullText(sourceFile?: SourceFile) {
        return this.node.getFullText(Node.getCompilerSourceFile(sourceFile));
    }

    replaceCompilerNode(compilerNode: NodeType) {
        this.node = compilerNode;
    }

    getRequiredSourceFile() {
        const sourceFile = this.getSourceFile();
        if (sourceFile == null)
            throw new Error("A source file or source file parent is required to do this operation.");
        return sourceFile;
    }

    getSourceFile(): SourceFile | null {
        const topParent = this.getTopParent();
        return (topParent != null && topParent.isSourceFile() ? topParent : null) as SourceFile | null;
    }

    getTopParent() {
        let parent = this as Node<ts.Node>;
        let nextParent = parent!.getParent();
        while (nextParent != null) {
            parent = nextParent;
            nextParent = parent!.getParent();
        }

        return parent;
    }

    getParent() {
        return (this.node.parent == null) ? null : this.factory.getNodeFromCompilerNode(this.node.parent);
    }

    ensureLastChildTextNewLine() {
        if (!this.isLastChildTextNewLine())
            this.appendChildNewLine();
    }

    isLastChildTextNewLine() {
        const sourceFile = this.getRequiredSourceFile();
        const text = this.getFullText(sourceFile);
        const newLineChar = this.factory.getLanguageService().getNewLine();
        /* istanbul ignore else */
        if (this.isSourceFile())
            return text.endsWith(newLineChar);
        else
            throw this.getNotImplementedError();
    }

    appendChildNewLine() {
        const newLineText = this.factory.getLanguageService().getNewLine();
        if (this.isSourceFile()) {
            const sourceFile = this as SourceFile;
            sourceFile.node.text += newLineText;
            sourceFile.node.end += newLineText.length;
        }
        else {
            const sourceFile = this.getRequiredSourceFile();
            const indentationText = this.getIndentationText(sourceFile);
            const lastToken = this.getLastToken(sourceFile);
            const lastTokenPos = lastToken.getStart();
            sourceFile.replaceText(lastTokenPos, lastTokenPos, newLineText + indentationText);
        }
    }

    /**
     * Gets the last token of this node. Usually this is a close brace.
     * @param sourceFile - Optional source file to help improve performance.
     */
    getLastToken(sourceFile = this.getRequiredSourceFile()) {
        return this.factory.getNodeFromCompilerNode(this.node.getLastToken(sourceFile.getCompilerNode()));
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

    /**
     * Gets if the current node is a source file.
     */
    isSourceFile(): this is SourceFile {
        return false;
    }

    /**
     * Gets an error to throw when a feature is not implemented for this node.
     * @internal
     */
    getNotImplementedError() {
        return errors.getNotImplementedForSyntaxKindError(this.getKind());
    }

    /**
     * Gets the indentation text.
     * @param sourceFile - Optional source file to help improve performance.
     */
    getIndentationText(sourceFile = this.getRequiredSourceFile()) {
        const sourceFileText = sourceFile.getFullText();
        const startLinePos = this.getStartLinePos(sourceFile);
        const startPos = this.getStart(sourceFile);
        let text = "";

        for (let i = startPos - 1; i >= startLinePos; i--) {
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
     * Gets the next indentation level text.
     * @param sourceFile - Optional source file to help improve performance.
     */
    getChildIndentationText(sourceFile = this.getRequiredSourceFile()) {
        return this.getIndentationText(sourceFile) + "    "; // todo: should get number of spaces/tabs from somewhere
    }

    /**
     * Gets the position of the start of the line that this node is on.
     * @param sourceFile - Optional source file to help improve performance.
     */
    getStartLinePos(sourceFile = this.getRequiredSourceFile()) {
        const sourceFileText = sourceFile.getFullText();
        const startPos = this.getStart();

        for (let i = startPos - 1; i >= 0; i--) {
            const currentChar = sourceFileText.substr(i, 1);
            if (currentChar === "\n")
                return i + 1;
        }

        return 0;
    }

    /**
     * Gets the start without trivia.
     * @param sourceFile - Optional source file to help improve performance.
     */
    getStart(sourceFile = this.getRequiredSourceFile()) {
        return this.node.getStart(sourceFile.getCompilerNode());
    }

    private static getCompilerSourceFile(sourceFile: SourceFile | undefined) {
        return sourceFile != null ? sourceFile.getCompilerNode() : undefined;
    }
}
