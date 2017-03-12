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

    /**
     * Gets the syntax kind.
     */
    getKind() {
        return this.node.kind;
    }

    containsChildBasedOnPosition(child: TsNode<ts.Node>) {
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

    insertText(insertPos: number, newText: string) {
        const tsSourceFile = this.getRequiredSourceFile();
        const currentText = tsSourceFile.getFullText();
        const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
        const tsTempSourceFile = this.factory.createTempSourceFileFromText(newFileText, tsSourceFile.getFileName());

        // temp solution
        function* wrapper() {
            for (let value of Array.from(tsSourceFile.getAllChildren()).map(t => t.getCompilerNode())) {
                yield value;
            }
        }

        // console.log(Array.from(tsSourceFile.getAllChildren()).map(t => t.getSyntaxKindName() + ":" + t.getPos() + ":" + t.getStart()));
        // console.log(Array.from(tsTempSourceFile.getAllChildren()).map(t => t.getSyntaxKindName() + ":" + t.getPos() + ":" + t.getStart()));
        const currentFileChildIterator = wrapper();
        const tempFileChildIterator = tsTempSourceFile.getAllChildren(tsTempSourceFile);
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

        this.factory.replaceCompilerNode(tsSourceFile, tsTempSourceFile.getCompilerNode());
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

        for (let child of parent.getChildren()) {
            if (!foundChild) {
                foundChild = child === this;
                continue;
            }

            yield child;
        }
    }

    *getChildren(): IterableIterator<TsNode<ts.Node>> {
        for (let child of this.node.getChildren()) {
            let tsChild = this.factory.getTsNodeFromNode(child);

            // flatten out syntax list
            if (tsChild.getKind() === ts.SyntaxKind.SyntaxList) {
                for (let syntaxChild of tsChild.getChildren()) {
                    yield syntaxChild;
                }
            }
            else {
                yield tsChild;
            }
        }
    }

    getMainChildren() {
        const childNodes: TsNode<ts.Node>[] = [];
        ts.forEachChild(this.node, childNode => {
            childNodes.push(this.factory.getTsNodeFromNode(childNode));
        });
        return childNodes;
    }

    *getAllChildren(tsSourceFile = this.getRequiredSourceFile()): IterableIterator<TsNode<ts.Node>> {
        for (let child of this.node.getChildren(tsSourceFile.getCompilerNode())) {
            let tsChild = this.factory.getTsNodeFromNode(child);
            yield tsChild;

            for (let tsChildChild of tsChild.getAllChildren(tsSourceFile))
                yield tsChildChild;
        }
    }

    getPos() {
        return this.node.pos;
    }

    getEnd() {
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
        const newLineText = this.factory.getLanguageService().getNewLine();
        if (this.isSourceFile()) {
            const sourceFile = this as TsSourceFile;
            sourceFile.node.text += newLineText;
            sourceFile.node.end += newLineText.length;
        }
        else {
            const tsSourceFile = this.getRequiredSourceFile();
            const indentationText = this.getIndentationText(tsSourceFile);
            const lastToken = this.getLastToken(tsSourceFile);
            const lastTokenPos = lastToken.getStart();
            tsSourceFile.replaceText(lastTokenPos, lastTokenPos, newLineText + indentationText);
        }
    }

    /**
     * Gets the last token of this node. Usually this is a close brace.
     * @param tsSourceFile - Optional source file.
     */
    getLastToken(tsSourceFile = this.getRequiredSourceFile()) {
        return this.factory.getTsNodeFromNode(this.node.getLastToken(tsSourceFile.getCompilerNode()));
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
    isSourceFile() : this is TsSourceFile {
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
        return `Not implemented feature for syntax kind '${this.getSyntaxKindName()}'.`;
    }

    /**
     * Gets the syntax kind name.
     */
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
        const startPos = this.getStart(tsSourceFile);
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
     * @param tsSourceFile - Optional source file.
     */
    getStartLinePos(tsSourceFile = this.getRequiredSourceFile()) {
        const sourceFileText = tsSourceFile.getFullText();
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
     * @param tsSourceFile - Optional source file.
     */
    getStart(tsSourceFile = this.getRequiredSourceFile()) {
        return this.node.getStart(tsSourceFile.getCompilerNode());
    }
}
