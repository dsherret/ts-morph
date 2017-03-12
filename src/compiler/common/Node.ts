import * as ts from "typescript";
import {Memoize, ArrayUtils} from "./../../utils";
import {CompilerFactory} from "./../../factories";
import {SourceFile} from "./../file";
import {syntaxKindToName} from "./../utils";

export class Node<NodeType extends ts.Node> {
    constructor(
        protected readonly factory: CompilerFactory,
        protected node: NodeType
    ) {
    }

    getCompilerNode() {
        return this.node;
    }

    /**
     * Gets the syntax kind.
     */
    getKind() {
        return this.node.kind;
    }

    containsChildBasedOnPosition(child: Node<ts.Node>) {
        return this.containsRange(child.getPos(), child.getEnd());
    }

    containsRange(startPosition: number, endPosition: number) {
        return this.getPos() <= startPosition && endPosition <= this.getEnd();
    }

    getOpenBraceToken() {
        // todo: have kind passed in
        for (let child of this.getChildren()) {
            if (child.getKind() === ts.SyntaxKind.OpenBraceToken)
                return child;
        }
        return null;
    }

    insertText(insertPos: number, newText: string) {
        const sourceFile = this.getRequiredSourceFile();
        const currentText = sourceFile.getFullText();
        const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
        const tempSourceFile = this.factory.createTempSourceFileFromText(newFileText, sourceFile.getFileName());

        // temp solution
        function* wrapper() {
            for (let value of Array.from(sourceFile.getAllChildren()).map(t => t.getCompilerNode())) {
                yield value;
            }
        }

        // console.log(Array.from(sourceFile.getAllChildren()).map(t => t.getKindName() + ":" + t.getPos() + ":" + t.getStart()));
        // console.log(Array.from(tempSourceFile.getAllChildren()).map(t => t.getKindName() + ":" + t.getPos() + ":" + t.getStart()));
        const currentFileChildIterator = wrapper();
        const tempFileChildIterator = tempSourceFile.getAllChildren(tempSourceFile);
        let currentChild = currentFileChildIterator.next().value;
        let hasPassed = false;

        for (let newChild of tempFileChildIterator) {
            const newChildPos = newChild.getPos();
            const newChildStart = newChild.getStart();

            if (newChildPos <= insertPos && !hasPassed) {
                if (newChild.getKind() !== currentChild.kind) {
                    hasPassed = true;
                    continue;
                }

                if (currentChild.pos !== newChild.getPos()) {
                    throw new Error("Unexpected! Perhaps a syntax error was inserted.");
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
            else if (newChildStart >= insertPos + newText.length) {
                const adjustedPos = newChildStart - newText.length;

                if (currentChild.getStart() !== adjustedPos || currentChild.kind !== newChild.getKind()) {
                    throw new Error("Unexpected! Perhaps a syntax error was inserted.");
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
        }

        this.factory.replaceCompilerNode(sourceFile, tempSourceFile.getCompilerNode());
    }

    offsetPositions(offset: number) {
        this.node.pos += offset;
        this.node.end += offset;

        for (let child of this.getChildren()) {
            child.offsetPositions(offset);
        }
    }

    getNextSibling() {
        const nextResult = this.getSiblingsAfter().next();
        return nextResult.done ? null : nextResult.value;
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

    getFullText(sourceFile?: SourceFile) {
        if (sourceFile != null)
            return this.node.getFullText(sourceFile.node);
        else
            return this.node.getFullText();
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

    *getAllParents() {
        let parent = this.getParent();
        while (parent != null) {
            yield parent;
            parent = parent.getParent();
        }
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
     * @param sourceFile - Optional source file.
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
    isSourceFile() : this is SourceFile {
        return false;
    }

    /**
     * Gets an error to throw when a feature is not implemented for this node.
     */
    getNotImplementedError() {
        return new Error(this.getNotImplementedMessage());
    }

    /**
     * Gets a message to say when a feature is not implemented for this node.
     */
    getNotImplementedMessage() {
        return `Not implemented feature for syntax kind '${this.getKindName()}'.`;
    }

    /**
     * Gets the syntax kind name.
     */
    getKindName() {
        return syntaxKindToName(this.node.kind);
    }

    /**
     * Gets the indentation text.
     * @param sourceFile - Optional source file.
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
     * Gets the position of the start of the line that this node is on.
     * @param sourceFile - Optional source file.
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
     * @param sourceFile - Optional source file.
     */
    getStart(sourceFile = this.getRequiredSourceFile()) {
        return this.node.getStart(sourceFile.getCompilerNode());
    }
}
