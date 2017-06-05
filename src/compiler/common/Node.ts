import * as ts from "typescript";
import * as errors from "./../../errors";
import {CompilerFactory} from "./../../factories";
import {replaceNodeText} from "./../../manipulation";
import {IDisposable} from "./../../utils";
import {SourceFile} from "./../file";
import * as base from "./../base";
import {ConstructorDeclaration, MethodDeclaration} from "./../class";
import {FunctionDeclaration} from "./../function";
import {TypeAliasDeclaration} from "./../type";
import {InterfaceDeclaration} from "./../interface";
import {NamespaceDeclaration} from "./../namespace";
import {Symbol} from "./Symbol";

export class Node<NodeType extends ts.Node = ts.Node> implements IDisposable {
    /** @internal */
    readonly factory: CompilerFactory;
    /** @internal */
    node: NodeType;
    /** @internal */
    sourceFile: SourceFile;

    /**
     * Initializes a new instance.
     * @internal
     * @param factory - Compiler factory.
     * @param node - Underlying node.
     */
    constructor(
        factory: CompilerFactory,
        node: NodeType,
        sourceFile: SourceFile
    ) {
        this.factory = factory;
        this.node = node;
        this.sourceFile = sourceFile;
    }

    /**
     * Releases the node from the cache and ast.
     */
    dispose() {
        for (const child of this.getChildren()) {
            child.dispose();
        }

        this.factory.removeNodeFromCache(this);
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
     * Gets the compiler symbol.
     */
    getSymbol(): Symbol | undefined {
        const boundSymbol = (this.node as any).symbol as ts.Symbol | undefined;
        if (boundSymbol != null)
            return this.factory.getSymbol(boundSymbol);

        const typeChecker = this.factory.getTypeChecker();
        const typeCheckerSymbol = typeChecker.getSymbolAtLocation(this);
        if (typeCheckerSymbol != null)
            return typeCheckerSymbol;

        const nameNode = (this.node as any).name as ts.Node | undefined;
        if (nameNode != null)
            return this.factory.getNodeFromCompilerNode(nameNode, this.sourceFile).getSymbol();

        return undefined;
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
     * Gets the first child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildByKindOrThrow(kind: ts.SyntaxKind) {
        const firstChild = this.getFirstChildByKind(kind);
        if (firstChild == null)
            throw new errors.InvalidOperationError(`A child of the kind ${ts.SyntaxKind[kind]} was expected.`);
        return firstChild;
    }

    /**
     * Gets the first child by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildByKind(kind: ts.SyntaxKind) {
        return this.getFirstChild(child => child.getKind() === kind);
    }

    /**
     * Gets the first child by a condition.
     * @param condition - Condition.
     */
    getFirstChild(condition: (node: Node) => boolean) {
        for (const child of this.getChildren()) {
            if (condition(child))
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

        for (const child of this.getChildren()) {
            child.offsetPositions(offset);
        }
    }

    getPreviousSibling() {
        let previousSibling: Node | undefined;

        for (const sibling of this.getSiblingsBefore()) {
            previousSibling = sibling;
        }

        return previousSibling;
    }

    getNextSibling() {
        const nextResult = this.getSiblingsAfter().next();
        return nextResult.done ? undefined : nextResult.value;
    }

    *getSiblingsBefore() {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();

        for (const child of parent.getChildrenIterator()) {
            if (child === this)
                return;

            yield child;
        }
    }

    *getSiblingsAfter() {
        // todo: optimize
        let foundChild = false;
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();

        for (const child of parent.getChildrenIterator()) {
            if (!foundChild) {
                foundChild = child === this;
                continue;
            }

            yield child;
        }
    }

    getChildren(): Node[] {
        return this.node.getChildren().map(n => this.factory.getNodeFromCompilerNode(n, this.sourceFile));
    }

    /**
     * @internal
     */
    *getChildrenIterator(): IterableIterator<Node> {
        for (const compilerChild of this.node.getChildren(this.sourceFile.getCompilerNode())) {
            yield this.factory.getNodeFromCompilerNode(compilerChild, this.sourceFile);
        }
    }

    /**
     * Gets the child syntax list or throws if it doesn't exist.
     */
    getChildSyntaxListOrThrow() {
        const syntaxList = this.getChildSyntaxList();
        if (syntaxList == null)
            throw new errors.InvalidOperationError("A child syntax list was expected.");
        return syntaxList;
    }

    /**
     * Gets the child syntax list if it exists.
     */
    getChildSyntaxList(): Node | undefined {
        let node: Node = this;
        if (this.isBodyableNode() || this.isBodiedNode())
            node = this.isBodyableNode() ? this.getBodyOrThrow() : this.getBody();

        if (node.isSourceFile() || this.isBodyableNode() || this.isBodiedNode())
            return node.getFirstChildByKind(ts.SyntaxKind.SyntaxList);

        let passedBrace = false;
        for (const child of node.getChildrenIterator()) {
            if (!passedBrace)
                passedBrace = child.getKind() === ts.SyntaxKind.FirstPunctuation;
            else if (child.getKind() === ts.SyntaxKind.SyntaxList)
                return child;
        }

        return undefined;
    }

    /**
     * Gets the children based on a kind.
     * @param kind - Syntax kind.
     */
    getChildrenOfKind<T extends Node = Node>(kind: ts.SyntaxKind) {
        return this.getChildren().filter(c => c.getKind() === kind) as T[];
    }

    *getAllChildren(): IterableIterator<Node> {
        for (const compilerChild of this.node.getChildren(this.sourceFile.getCompilerNode())) {
            const child = this.factory.getNodeFromCompilerNode(compilerChild, this.sourceFile);
            yield child;

            for (const childChild of child.getAllChildren())
                yield childChild;
        }
    }

    /**
     * Gets the child count.
     */
    getChildCount() {
        return this.node.getChildCount(this.sourceFile.getCompilerNode());
    }

    /**
     * Gets the start position with leading trivia.
     */
    getPos() {
        return this.node.pos;
    }

    /**
     * Gets the end position.
     */
    getEnd() {
        return this.node.end;
    }

    /**
     * Gets the width of the node (length without trivia).
     */
    getWidth() {
        return this.node.getWidth(this.sourceFile.getCompilerNode());
    }

    /**
     * Gets the full width of the node (length with trivia).
     */
    getFullWidth() {
        return this.node.getFullWidth();
    }

    /**
     * Gets the text without leading trivia.
     */
    getText() {
        return this.node.getText(this.sourceFile.getCompilerNode());
    }

    /**
     * Gets the full text with leading trivia.
     */
    getFullText() {
        return this.node.getFullText(this.sourceFile.getCompilerNode());
    }

    /**
     * Gets the combined modifier flags.
     */
    getCombinedModifierFlags() {
        return ts.getCombinedModifierFlags(this.node);
    }

    replaceCompilerNode(compilerNode: NodeType) {
        this.node = compilerNode;
    }

    /**
     * Gets the source file.
     */
    getSourceFile(): SourceFile {
        return this.sourceFile;
    }

    /**
     * Goes up the tree yielding all the parents in order.
     */
    *getParents() {
        let parent = (this as Node).getParent();
        while (parent != null) {
            yield parent;
            parent = parent!.getParent();
        }
    }

    getTopParent() {
        let currentParent = this as Node;
        for (const parent of this.getParents()) {
            currentParent = parent;
        }
        return currentParent;
    }

    getParent() {
        return (this.node.parent == null) ? undefined : this.factory.getNodeFromCompilerNode(this.node.parent, this.sourceFile);
    }

    /**
     * Gets the parent or throws an error if it doesn't exist.
     */
    getParentOrThrow() {
        const parentNode = this.getParent();
        if (parentNode == null)
            throw new Error("A parent is required to do this operation.");
        return parentNode;
    }

    appendNewLineSeparatorIfNecessary() {
        const text = this.getFullText();
        if (this.isSourceFile()) {
            const hasText = text.length > 0;
            if (hasText)
                this.ensureLastChildNewLine();
        }
        else
            this.ensureLastChildNewLine();
    }

    ensureLastChildNewLine() {
        if (!this.isLastChildTextNewLine())
            this.appendChildNewLine();
    }

    isLastChildTextNewLine(): boolean {
        const text = this.getFullText();
        /* istanbul ignore else */
        if (this.isSourceFile())
            return text.endsWith("\n");
        else if (this.isBodyableNode() || this.isBodiedNode()) {
            const body = this.isBodyableNode() ? this.getBodyOrThrow() : this.getBody();
            const bodyText = body.getFullText();
            return /\n\s*\}$/.test(bodyText);
        }
        else
            throw this.getNotImplementedError();
    }

    appendChildNewLine() {
        const newLineText = this.factory.getLanguageService().getNewLine();
        if (this.isSourceFile()) {
            this.sourceFile.node.text += newLineText;
            this.sourceFile.node.end += newLineText.length;
        }
        else {
            const indentationText = this.getIndentationText();
            const lastToken = this.getLastToken();
            const lastTokenPos = lastToken.getStart();
            replaceNodeText(this.sourceFile, lastTokenPos, lastTokenPos, newLineText + indentationText);
        }
    }

    /**
     * Gets the last token of this node. Usually this is a close brace.
     */
    getLastToken() {
        const lastToken = this.node.getLastToken(this.sourceFile.getCompilerNode());
        /* istanbul ignore if */
        if (lastToken == null)
            throw new errors.NotImplementedError("Not implemented scenario where the last token does not exist");

        return this.factory.getNodeFromCompilerNode(lastToken, this.sourceFile);
    }

    /**
     * Gets if this node is in a syntax list.
     */
    isInSyntaxList() {
        return this.getParentSyntaxList() != null;
    }

    /**
     * Gets the parent if it's a syntax list.
     */
    getParentSyntaxList() {
        const parent = this.getParent();
        if (parent == null)
            return undefined;

        const pos = this.getPos();
        const end = this.getEnd();
        for (const child of parent.getChildren()) {
            if (child.getPos() > pos || child === this)
                return undefined;

            if (child.getKind() === ts.SyntaxKind.SyntaxList && child.getPos() <= pos && child.getEnd() >= end)
                return child;
        }

        return undefined; // shouldn't happen
    }

    /**
     * Gets the child index of this node relative to the parent.
     */
    getChildIndex() {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        let i = 0;
        for (const child of parent.getChildren()) {
            if (child === this)
                return i;
            i++;
        }

        /* istanbul ignore next */
        throw new errors.NotImplementedError("For some reason the child's parent did not contain the child.");
    }

    /**
     * Gets the parent if it's a syntax list or throws an error otherwise.
     */
    getParentSyntaxListOrThrow() {
        const parentSyntaxList = this.getParentSyntaxList();
        if (parentSyntaxList == null)
            throw new errors.InvalidOperationError("The parent must be a SyntaxList in order to get the required parent syntax list.");
        return parentSyntaxList;
    }

    /**
     * Gets if the current node is a source file.
     * @internal
     */
    isSourceFile(): this is SourceFile {
        return this.node.kind === ts.SyntaxKind.SourceFile;
    }

    /**
     * Gets if the current node is a constructor declaration.
     * @internal
     */
    isConstructorDeclaration(): this is ConstructorDeclaration {
        return this.node.kind === ts.SyntaxKind.Constructor;
    }

    /**
     * Gets if the current node is a function declaration.
     * @internal
     */
    isFunctionDeclaration(): this is FunctionDeclaration {
        return this.node.kind === ts.SyntaxKind.FunctionDeclaration;
    }

    /**
     * Gets if the current node is an interface declaration.
     * @internal
     */
    isInterfaceDeclaration(): this is InterfaceDeclaration {
        return this.node.kind === ts.SyntaxKind.InterfaceDeclaration;
    }

    /**
     * Gets if the current node is a namespace declaration.
     * @internal
     */
    isNamespaceDeclaration(): this is NamespaceDeclaration {
        return this.node.kind === ts.SyntaxKind.ModuleDeclaration;
    }

    /**
     * Gets if the current node is a type alias declaration.
     * @internal
     */
    isTypeAliasDeclaration(): this is TypeAliasDeclaration {
        return this.node.kind === ts.SyntaxKind.TypeAliasDeclaration;
    }

    /**
     * Gets if the current node is a modifierable node.
     * @internal
     */
    isModifierableNode(): this is base.ModifierableNode {
        return (this as any)[nameof<base.ModifierableNode>(n => n.addModifier)] != null;
    }

    /**
     * Gets if the current node is a method declaration.
     * @internal
     */
    isMethodDeclaration(): this is MethodDeclaration {
        return this.node.kind === ts.SyntaxKind.MethodDeclaration;
    }

    /* Mixin type guards (overridden in mixins to set to true) */

    /**
     * Gets if this is a bodied node.
     */
    isBodiedNode(): this is base.BodiedNode {
        return false;
    }

    /**
     * Gets if this is a bodyable node.
     */
    isBodyableNode(): this is base.BodyableNode {
        return false;
    }

    /**
     * Gets if this is an initializer expressionable node.
     */
    isInitializerExpressionableNode(): this is base.InitializerExpressionableNode {
        return false;
    }

    /* End mixin type guards */

    /**
     * Gets an error to throw when a feature is not implemented for this node.
     * @internal
     */
    getNotImplementedError() {
        return errors.getNotImplementedForSyntaxKindError(this.getKind());
    }

    /**
     * Gets the indentation text.
     */
    getIndentationText() {
        const sourceFileText = this.sourceFile.getFullText();
        const startLinePos = this.getStartLinePos();
        const startPos = this.getStart();
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
     */
    getChildIndentationText() {
        if (this.isSourceFile())
            return "";

        const oneIndentationLevelText = this.factory.getLanguageService().getOneIndentationLevelText();
        return this.getIndentationText() + oneIndentationLevelText;
    }

    /**
     * Gets the position of the start of the line that this node is on.
     */
    getStartLinePos() {
        const sourceFileText = this.sourceFile.getFullText();
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
     */
    getStart() {
        return this.node.getStart(this.sourceFile.getCompilerNode());
    }
}
