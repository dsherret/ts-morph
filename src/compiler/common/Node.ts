import * as ts from "typescript";
import CodeBlockWriter from "code-block-writer";
import * as errors from "./../../errors";
import {GlobalContainer} from "./../../GlobalContainer";
import {IndentationText} from "./../../ManipulationSettings";
import {getNextNonWhitespacePos, getPreviousMatchingPos} from "./../../manipulation/textSeek";
import {insertIntoParent} from "./../../manipulation/insertion";
import {TypeGuards, getTextFromStringOrWriter, ArrayUtils} from "./../../utils";
import {SourceFile} from "./../file";
import * as base from "./../base";
import {ConstructorDeclaration, MethodDeclaration} from "./../class";
import {FunctionDeclaration} from "./../function";
import {TypeAliasDeclaration} from "./../type";
import {InterfaceDeclaration} from "./../interface";
import {NamespaceDeclaration} from "./../namespace";
import {Symbol} from "./Symbol";
import {SyntaxList} from "./SyntaxList";

export class Node<NodeType extends ts.Node = ts.Node> {
    /** @internal */
    readonly global: GlobalContainer;
    /** @internal */
    private _compilerNode: NodeType | undefined;
    /** @internal */
    sourceFile: SourceFile;

    /**
     * Gets the underlying compiler node.
     */
    get compilerNode(): NodeType {
        if (this._compilerNode == null)
            throw new errors.InvalidOperationError("Attempted to get information from a node that was removed or forgotten.");
        return this._compilerNode;
    }

    /**
     * Initializes a new instance.
     * @internal
     * @param global - Global container.
     * @param node - Underlying node.
     * @param sourceFile - Source file for the node.
     */
    constructor(
        global: GlobalContainer,
        node: NodeType,
        sourceFile: SourceFile
    ) {
        this.global = global;
        this._compilerNode = node;
        this.sourceFile = sourceFile;
    }

    /**
     * Releases the node and all its descendants from the underlying node cache and ast.
     *
     * This is useful if you want to improve the performance of manipulation by not tracking this node anymore.
     */
    forget() {
        if (this.wasForgotten())
            return;

        for (const child of this.getChildrenInCacheIterator())
            child.forget();

        this.forgetOnlyThis();
    }

    /**
     * Only forgets this node.
     * @internal
     */
    forgetOnlyThis() {
        if (this.wasForgotten())
            return;

        this.global.compilerFactory.removeNodeFromCache(this);
        this._compilerNode = undefined;
    }

    /**
     * Gets if the node was forgotten.
     * @internal
     */
    wasForgotten() {
        return this._compilerNode == null;
    }

    /**
     * Gets the syntax kind.
     */
    getKind() {
        return this.compilerNode.kind;
    }

    /**
     * Gets the syntax kind name.
     */
    getKindName() {
        return ts.SyntaxKind[this.compilerNode.kind];
    }

    /**
     * Gets the compiler symbol.
     */
    getSymbol(): Symbol | undefined {
        const boundSymbol = (this.compilerNode as any).symbol as ts.Symbol | undefined;
        if (boundSymbol != null)
            return this.global.compilerFactory.getSymbol(boundSymbol);

        const typeChecker = this.global.typeChecker;
        const typeCheckerSymbol = typeChecker.getSymbolAtLocation(this);
        if (typeCheckerSymbol != null)
            return typeCheckerSymbol;

        const nameNode = (this.compilerNode as any).name as ts.Node | undefined;
        if (nameNode != null)
            return getWrappedNode(this, nameNode).getSymbol();

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
     * Gets the first child by a condition or throws.
     * @param condition - Condition.
     */
    getFirstChildOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getFirstChild(condition), "Could not find a child that matched the specified condition.");
    }

    /**
     * Gets the first child by a condition.
     * @param condition - Condition.
     */
    getFirstChild(condition?: (node: Node) => boolean) {
        const firstChild = this.getCompilerFirstChild(getWrappedCondition(this, condition));
        return firstChild == null ? undefined : getWrappedNode(this, firstChild);
    }

    /**
     * Gets the last child by a condition or throws.
     * @param condition - Condition.
     */
    getLastChildOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getLastChild(condition), "Could not find a child that matched the specified condition.");
    }

    /**
     * Gets the last child by a condition.
     * @param condition - Condition.
     */
    getLastChild(condition?: (node: Node) => boolean) {
        const lastChild = this.getCompilerLastChild(getWrappedCondition(this, condition));
        return lastChild == null ? undefined : getWrappedNode(this, lastChild);
    }

    /**
     * Gets the first descendant by a condition or throws.
     * @param condition - Condition.
     */
    getFirstDescendantOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getFirstDescendant(condition), "Could not find a descendant that matched the specified condition.");
    }

    /**
     * Gets the first descendant by a condition.
     * @param condition - Condition.
     */
    getFirstDescendant(condition?: (node: Node) => boolean) {
        for (const descendant of this.getDescendantsIterator()) {
            if (condition == null || condition(descendant))
                return descendant;
        }
        return undefined;
    }

    /**
     * Offset this node's positions (pos and end) and all of its children by the given offset.
     * @internal
     * @param offset - Offset.
     */
    offsetPositions(offset: number) {
        this.compilerNode.pos += offset;
        this.compilerNode.end += offset;

        for (const child of this.getChildren()) {
            child.offsetPositions(offset);
        }
    }

    /**
     * Gets the previous sibling or throws.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getPreviousSiblingOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getPreviousSibling(condition), "Could not find the previous sibling.");
    }

    /**
     * Gets the previous sibling.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getPreviousSibling(condition?: (node: Node) => boolean) {
        const previousSibling = this.getCompilerPreviousSibling(getWrappedCondition(this, condition));
        return previousSibling == null ? undefined : getWrappedNode(this, previousSibling);
    }

    /**
     * Gets the next sibling or throws.
     * @param condition - Optional condition for getting the next sibling.
     */
    getNextSiblingOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getNextSibling(condition), "Could not find the next sibling.");
    }

    /**
     * Gets the next sibling.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getNextSibling(condition?: (node: Node) => boolean) {
        const nextSibling = this.getCompilerNextSibling(getWrappedCondition(this, condition));
        return nextSibling == null ? undefined : getWrappedNode(this, nextSibling);
    }

    /**
     * Gets the previous siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getPreviousSiblings() {
        return this.getCompilerPreviousSiblings().map(n => getWrappedNode(this, n));
    }

    /**
     * Gets the next siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getNextSiblings() {
        return this.getCompilerNextSiblings().map(n => getWrappedNode(this, n));
    }

    /**
     * Gets the children of the node.
     */
    getChildren(): Node[] {
        return this.getCompilerChildren().map(n => getWrappedNode(this, n));
    }

    /**
     * Gets the child at the specified index.
     * @param index - Index of the child.
     */
    getChildAtIndex(index: number) {
        return getWrappedNode(this, this.getCompilerChildAtIndex(index));
    }

    /**
     * @internal
     */
    *getChildrenIterator(): IterableIterator<Node> {
        for (const compilerChild of this.getCompilerChildren())
            yield getWrappedNode(this, compilerChild);
    }

    /**
     * @internal
     */
    *getChildrenInCacheIterator(): IterableIterator<Node> {
        for (const child of this.getCompilerChildren()) {
            if (this.global.compilerFactory.hasCompilerNode(child))
                yield this.global.compilerFactory.getExistingCompilerNode(child)!;
            else if (child.kind === ts.SyntaxKind.SyntaxList) {
                // always return syntax lists because their children could be in the cache
                yield getWrappedNode(this, child);
            }
        }
    }

    /**
     * Gets the child syntax list or throws if it doesn't exist.
     */
    getChildSyntaxListOrThrow() {
        return errors.throwIfNullOrUndefined(this.getChildSyntaxList(), "A child syntax list was expected.");
    }

    /**
     * Gets the child syntax list if it exists.
     */
    getChildSyntaxList(): SyntaxList | undefined {
        let node: Node = this;
        if (TypeGuards.isBodyableNode(node) || TypeGuards.isBodiedNode(node)) {
            do {
                node = TypeGuards.isBodyableNode(node) ? node.getBodyOrThrow() : node.getBody();
            } while ((TypeGuards.isBodyableNode(node) || TypeGuards.isBodiedNode(node)) && (node.compilerNode as ts.Block).statements == null);
        }

        if (TypeGuards.isSourceFile(node) || TypeGuards.isBodyableNode(this) || TypeGuards.isBodiedNode(this))
            return node.getFirstChildByKind(ts.SyntaxKind.SyntaxList) as SyntaxList | undefined;

        let passedBrace = false;
        for (const child of node.getCompilerChildren()) {
            if (!passedBrace)
                passedBrace = child.kind === ts.SyntaxKind.FirstPunctuation;
            else if (child.kind === ts.SyntaxKind.SyntaxList)
                return getWrappedNode(this, child) as SyntaxList;
        }

        return undefined;
    }

    /**
     * Gets the node's descendants.
     */
    getDescendants(): Node[] {
        return ArrayUtils.from(this.getDescendantsIterator());
    }

    /**
     * Gets the node's descendants as an iterator.
     * @internal
     */
    *getDescendantsIterator(): IterableIterator<Node> {
        for (const descendant of this.getCompilerDescendantsIterator())
            yield getWrappedNode(this, descendant);
    }

    /**
     * Gets the child count.
     */
    getChildCount() {
        return this.compilerNode.getChildCount(this.sourceFile.compilerNode);
    }

    /**
     * Gets the child at the provided position, or undefined if not found.
     * @param pos - Position to search for.
     */
    getChildAtPos(pos: number): Node | undefined {
        if (pos < this.getPos() || pos >= this.getEnd())
            return undefined;

        for (const child of this.getCompilerChildren()) {
            if (pos >= child.pos && pos < child.end)
                return getWrappedNode(this, child);
        }

        return undefined;
    }

    /**
     * Gets the most specific descendant at the provided position, or undefined if not found.
     * @param pos - Position to search for.
     */
    getDescendantAtPos(pos: number): Node | undefined {
        let node: Node | undefined;

        while (true) {
            const nextNode: Node | undefined = (node || this).getChildAtPos(pos);
            if (nextNode == null)
                return node;
            else
                node = nextNode;
        }
    }

    /**
     * Gets the most specific descendant at the provided start position with the specified width, or undefined if not found.
     * @param start - Start position to search for.
     * @param width - Width of the node to search for.
     */
    getDescendantAtStartWithWidth(start: number, width: number): Node | undefined {
        let nextNode: Node | undefined = this.getSourceFile();
        let foundNode: Node | undefined;

        do {
            nextNode = nextNode.getChildAtPos(start);
            if (nextNode != null) {
                if (nextNode.getStart() === start && nextNode.getWidth() === width)
                    foundNode = nextNode;
                else if (foundNode != null)
                    break; // no need to keep looking
            }
        } while (nextNode != null);

        return foundNode;
    }

    /**
     * Gets the start position with leading trivia.
     */
    getPos() {
        return this.compilerNode.pos;
    }

    /**
     * Gets the end position.
     */
    getEnd() {
        return this.compilerNode.end;
    }

    /**
     * Gets the start position without leading trivia.
     */
    getStart() {
        return this.compilerNode.getStart(this.sourceFile.compilerNode);
    }

    /**
     * Gets the first position from the pos that is not whitespace.
     */
    getNonWhitespaceStart() {
        return getNextNonWhitespacePos(this.sourceFile.getFullText(), this.getPos());
    }

    /**
     * Gets the width of the node (length without trivia).
     */
    getWidth() {
        return this.compilerNode.getWidth(this.sourceFile.compilerNode);
    }

    /**
     * Gets the full width of the node (length with trivia).
     */
    getFullWidth() {
        return this.compilerNode.getFullWidth();
    }

    /**
     * Gets the text without leading trivia.
     */
    getText() {
        return this.compilerNode.getText(this.sourceFile.compilerNode);
    }

    /**
     * Gets the full text with leading trivia.
     */
    getFullText() {
        return this.compilerNode.getFullText(this.sourceFile.compilerNode);
    }

    /**
     * Gets the combined modifier flags.
     */
    getCombinedModifierFlags() {
        return ts.getCombinedModifierFlags(this.compilerNode);
    }

    /**
     * @internal
     */
    replaceCompilerNode(compilerNode: NodeType) {
        this._compilerNode = compilerNode;
    }

    /**
     * Gets the source file.
     */
    getSourceFile(): SourceFile {
        return this.sourceFile;
    }

    /**
     * Gets a compiler node property wrapped in a Node.
     * @param propertyName - Property name.
     */
    getNodeProperty<KeyType extends keyof NodeType>(propertyName: KeyType): Node<NodeType[KeyType]> {
        // todo: once filtering keys by type is supported need to (1) make this only show keys that are of type ts.Node and (2) have ability to return an array of nodes.
        if ((this.compilerNode[propertyName] as any).kind == null)
            throw new errors.InvalidOperationError(`Attempted to get property '${propertyName}', but ${nameof<this>(n => n.getNodeProperty)} ` +
                `only works with properties that return a node.`);
        return getWrappedNode(this, this.compilerNode[propertyName]) as Node<NodeType[KeyType]>;
    }

    /**
     * Goes up the tree getting all the parents in ascending order.
     */
    getAncestors() {
        return ArrayUtils.from(this.getAncestorsIterator());
    }

    /**
     * @internal
     */
    *getAncestorsIterator() {
        let parent = (this as Node).getParent();
        while (parent != null) {
            yield parent;
            parent = parent!.getParent();
        }
    }

    /**
     * Get the node's parent.
     */
    getParent() {
        return this.compilerNode.parent == null ? undefined : getWrappedNode(this, this.compilerNode.parent);
    }

    /**
     * Gets the parent or throws an error if it doesn't exist.
     */
    getParentOrThrow() {
        return errors.throwIfNullOrUndefined(this.getParent(), "A parent is required to do this operation.");
    }

    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Throws if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhileOrThrow(condition: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getParentWhile(condition), "The initial parent did not match the provided condition.");
    }

    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Returns undefined if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhile(condition: (node: Node) => boolean) {
        let node: Node | undefined = undefined;
        let nextParent = this.getParent();
        while (nextParent != null && condition(nextParent)) {
            node = nextParent;
            nextParent = nextParent.getParent();
        }

        return node;
    }

    /**
     * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
     * Throws if the initial parent is not the specified syntax kind.
     * @param kind - Syntax kind to check for.
     */
    getParentWhileKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getParentWhileKind(kind), `The initial parent was not a syntax kind of ${ts.SyntaxKind[kind]}.`);
    }

    /**
     * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
     * Returns undefined if the initial parent is not the specified syntax kind.
     * @param kind - Syntax kind to check for.
     */
    getParentWhileKind(kind: ts.SyntaxKind) {
        return this.getParentWhile(n => n.getKind() === kind);
    }

    /**
     * Gets the last token of this node. Usually this is a close brace.
     */
    getLastToken() {
        const lastToken = this.compilerNode.getLastToken(this.sourceFile.compilerNode);
        if (lastToken == null)
            throw new errors.NotImplementedError("Not implemented scenario where the last token does not exist.");

        return getWrappedNode(this, lastToken);
    }

    /**
     * Gets if this node is in a syntax list.
     */
    isInSyntaxList() {
        return this.getParentSyntaxList() != null;
    }

    /**
     * Gets the parent if it's a syntax list or throws an error otherwise.
     */
    getParentSyntaxListOrThrow() {
        return errors.throwIfNullOrUndefined(this.getParentSyntaxList(), "Expected the parent to be a syntax list.");
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
        for (const child of parent.getCompilerChildren()) {
            if (child.pos > pos || child === this.compilerNode)
                return undefined;

            if (child.kind === ts.SyntaxKind.SyntaxList && child.pos <= pos && child.end >= end)
                return getWrappedNode(this, child);
        }

        return undefined; // shouldn't happen
    }

    /**
     * Gets the child index of this node relative to the parent.
     */
    getChildIndex() {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        let i = 0;
        for (const child of parent.getCompilerChildren()) {
            if (child === this.compilerNode)
                return i;
            i++;
        }

        /* istanbul ignore next */
        throw new errors.NotImplementedError("For some reason the child's parent did not contain the child.");
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
        if (TypeGuards.isSourceFile(this))
            return "";

        return this.getIndentationText() + this.global.manipulationSettings.getIndentationText();
    }

    /**
     * Gets the position of the start of the line that this node starts on.
     */
    getStartLinePos() {
        const sourceFileText = this.sourceFile.getFullText();
        return getPreviousMatchingPos(sourceFileText, this.getStart(), char => char === "\n");
    }

    /**
     * Gets if this is the first node on the current line.
     */
    isFirstNodeOnLine() {
        const sourceFileText = this.sourceFile.getFullText();
        const startPos = this.getNonWhitespaceStart();

        for (let i = startPos - 1; i >= 0; i--) {
            const currentChar = sourceFileText[i];
            if (currentChar === " " || currentChar === "\t")
                continue;
            if (currentChar === "\n")
                return true;

            return false;
        }

        return true; // first node on the first line
    }

    /**
     * Replaces the text of the current node with new text.
     *
     * This will forget the current node and return a new node that can be asserted or type guarded to the correct type.
     * @param writerFunction - Write the text using the provided writer.
     * @returns The new node.
     */
    replaceWithText(writerFunction: (writer: CodeBlockWriter) => void): Node;
    /**
     * Replaces the text of the current node with new text.
     *
     * This will forget the current node and return a new node that can be asserted or type guarded to the correct type.
     * @param text - Text to replace with.
     * @returns The new node.
     */
    replaceWithText(text: string): Node;
    replaceWithText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
        const newText = getTextFromStringOrWriter(this.global.manipulationSettings, textOrWriterFunction);
        if (TypeGuards.isSourceFile(this)) {
            this.replaceText([this.getPos(), this.getEnd()], newText);
            return this;
        }

        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        const childIndex = this.getChildIndex();

        try {
            insertIntoParent({
                parent,
                childIndex,
                insertItemsCount: 1,
                insertPos: this.getStart(),
                newText,
                replacing: {
                    nodes: [this],
                    textLength: this.getWidth()
                }
            });
        } catch (err) {
            throw new errors.InvalidOperationError(`${nameof<Node>(n => n.replaceWithText)} currently only supports replacing the current node ` +
                `with a single new node. If you need the ability to replace it with multiple nodes, then please open an issue.\n\nInner error: ` + err);
        }

        return parent.getChildren()[childIndex];
    }

    /**
     * Gets the children based on a kind.
     * @param kind - Syntax kind.
     */
    getChildrenOfKind(kind: ts.SyntaxKind) {
        return this.getCompilerChildren().filter(c => c.kind === kind).map(c => getWrappedNode(this, c));
    }

    /**
     * Gets the first child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildByKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstChildByKind(kind), `A child of the kind ${ts.SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the first child by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildByKind(kind: ts.SyntaxKind) {
        const child = this.getCompilerFirstChild(c => c.kind === kind);
        return child == null ? undefined : getWrappedNode(this, child);
    }

    /**
     * Gets the first child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstChildIfKind(kind), `A first child of the kind ${ts.SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the first child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKind(kind: ts.SyntaxKind) {
        const firstChild = this.getCompilerFirstChild();
        return firstChild != null && firstChild.kind === kind ? getWrappedNode(this, firstChild) : undefined;
    }

    /**
     * Gets the last child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildByKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getLastChildByKind(kind), `A child of the kind ${ts.SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the last child by syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildByKind(kind: ts.SyntaxKind) {
        const lastChild = this.getCompilerLastChild(c => c.kind === kind);
        return lastChild == null ? undefined : getWrappedNode(this, lastChild);
    }

    /**
     * Gets the last child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildIfKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getLastChildIfKind(kind), `A last child of the kind ${ts.SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the last child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildIfKind(kind: ts.SyntaxKind) {
        const lastChild = this.getCompilerLastChild();
        return lastChild != null && lastChild.kind === kind ? getWrappedNode(this, lastChild) : undefined;
    }

    /**
     * Gets the child at the specified index if it's the specified kind or throws an exception.
     * @param index - Index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKindOrThrow(index: number, kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getChildAtIndexIfKind(index, kind), `Child at index ${index} was expected to be ${ts.SyntaxKind[kind]}`);
    }

    /**
     * Gets the child at the specified index if it's the specified kind or returns undefined.
     * @param index - Index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKind(index: number, kind: ts.SyntaxKind) {
        const node = this.getCompilerChildAtIndex(index);
        return node.kind === kind ? getWrappedNode(this, node) : undefined;
    }

    /**
     * Gets the previous sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getPreviousSiblingIfKind(kind), `A previous sibling of kind ${ts.SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the next sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getNextSiblingIfKind(kind), `A next sibling of kind ${ts.SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the previous sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKind(kind: ts.SyntaxKind) {
        const previousSibling = this.getCompilerPreviousSibling();
        return previousSibling != null && previousSibling.kind === kind ? getWrappedNode(this, previousSibling) : undefined;
    }

    /**
     * Gets the next sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKind(kind: ts.SyntaxKind) {
        const nextSibling = this.getCompilerNextSibling();
        return nextSibling != null && nextSibling.kind === kind ? getWrappedNode(this, nextSibling) : undefined;
    }

    /**
     * Gets the parent if it's a certain syntax kind.
     */
    getParentIfKind(kind: ts.SyntaxKind) {
        const parentNode = this.getParent();
        return parentNode == null || parentNode.getKind() !== kind ? undefined : parentNode;
    }

    /**
     * Gets the parent if it's a certain syntax kind of throws.
     */
    getParentIfKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getParentIfKind(kind), `A parent with a syntax kind of ${ts.SyntaxKind[kind]} is required to do this operation.`);
    }

    /**
     * Gets the first ancestor by syntax kind or throws if not found.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstAncestorByKind(kind), `A parent of kind ${ts.SyntaxKind[kind]} is required to do this operation.`);
    }

    /**
     * Get the first ancestor by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKind(kind: ts.SyntaxKind) {
        for (const parent of this.getAncestors()) {
            if (parent.getKind() === kind)
                return parent;
        }
        return undefined;
    }

    /**
     * Gets the descendants that match a specified syntax kind.
     * @param kind - Kind to check.
     */
    getDescendantsOfKind(kind: ts.SyntaxKind) {
        const descendants: Node[] = [];
        for (const descendant of this.getCompilerDescendantsIterator()) {
            if (descendant.kind === kind)
                descendants.push(getWrappedNode(this, descendant));
        }
        return descendants;
    }

    /**
     * Gets the first descendant by syntax kind or throws.
     * @param kind - Syntax kind.
     */
    getFirstDescendantByKindOrThrow(kind: ts.SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstDescendantByKind(kind), `A descendant of kind ${ts.SyntaxKind[kind]} is required to do this operation.`);
    }

    /**
     * Gets the first descendant by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstDescendantByKind(kind: ts.SyntaxKind) {
        for (const descendant of this.getCompilerDescendantsIterator()) {
            if (descendant.kind === kind)
                return getWrappedNode(this, descendant);
        }
        return undefined;
    }

    /**
     * Gets the compiler children of the node.
     * @internal
     */
    getCompilerChildren(): ts.Node[] {
        return this.compilerNode.getChildren(this.sourceFile.compilerNode);
    }

    /**
     * Gets the node's descendant compiler nodes as an iterator.
     * @internal
     */
    getCompilerDescendantsIterator(): IterableIterator<ts.Node> {
        const compilerSourceFile = this.sourceFile.compilerNode;
        return getDescendantsIterator(this.compilerNode);

        function* getDescendantsIterator(node: ts.Node): IterableIterator<ts.Node> {
            for (const child of node.getChildren(compilerSourceFile)) {
                yield child;
                yield* getDescendantsIterator(child);
            }
        }
    }

    /**
     * Gets the first compiler node child that matches the condition.
     * @param condition - Condition.
     * @internal
     */
    getCompilerFirstChild(condition?: (node: ts.Node) => boolean) {
        for (const child of this.getCompilerChildren()) {
            if (condition == null || condition(child))
                return child;
        }
        return undefined;
    }

    /**
     * Gets the last compiler node child that matches the condition.
     * @param condition - Condition.
     * @internal
     */
    getCompilerLastChild(condition?: (node: ts.Node) => boolean) {
        const children = this.getCompilerChildren();
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            if (condition == null || condition(child))
                return child;
        }
        return undefined;
    }

    /**
     * Gets the previous compiler siblings.
     *
     * Note: Closest sibling is the zero index.
     * @internal
     */
    getCompilerPreviousSiblings() {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        const previousSiblings: ts.Node[] = [];

        for (const child of parent.getCompilerChildren()) {
            if (child === this.compilerNode)
                break;
            previousSiblings.unshift(child);
        }

        return previousSiblings;
    }

    /**
     * Gets the next compiler siblings.
     *
     * Note: Closest sibling is the zero index.
     * @internal
     */
    getCompilerNextSiblings() {
        let foundChild = false;
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        const nextSiblings: ts.Node[] = [];

        for (const child of parent.getCompilerChildren()) {
            if (!foundChild) {
                foundChild = child === this.compilerNode;
                continue;
            }

            nextSiblings.push(child);
        }

        return nextSiblings;
    }

    /**
     * Gets the previous compiler sibling.
     * @param condition - Optional condition for getting the previous sibling.
     * @internal
     */
    getCompilerPreviousSibling(condition?: (node: ts.Node) => boolean) {
        for (const sibling of this.getCompilerPreviousSiblings()) {
            if (condition == null || condition(sibling))
                return sibling;
        }

        return undefined;
    }

    /**
     * Gets the next compiler sibling.
     * @param condition - Optional condition for getting the previous sibling.
     * @internal
     */
    getCompilerNextSibling(condition?: (node: ts.Node) => boolean) {
        for (const sibling of this.getCompilerNextSiblings()) {
            if (condition == null || condition(sibling))
                return sibling;
        }

        return undefined;
    }

    /**
     * Gets the compiler child at the specified index.
     * @param index - Index.
     * @internal
     */
    getCompilerChildAtIndex(index: number) {
        const children = this.getCompilerChildren();
        errors.throwIfOutOfRange(index, [0, children.length - 1], nameof(index));
        return children[index];
    }

    /**
     * Gets a writer with the child indentation text.
     * @internal
     */
    getChildWriter() {
        const writer = this.getWriter();
        writer.setIndentationLevel(this.getChildIndentationText());
        return writer;
    }

    /**
     * Gets a writer with no child indentation text.
     * @internal
     */
    getWriter() {
        const indentationText = this.global.manipulationSettings.getIndentationText();
        return new CodeBlockWriter({
            newLine: this.global.manipulationSettings.getNewLineKind(),
            indentNumberOfSpaces: indentationText === IndentationText.Tab ? undefined : indentationText.length,
            useTabs: indentationText === IndentationText.Tab
        });
    }
}

function getWrappedNode(thisNode: Node, compilerNode: ts.Node) {
    return thisNode.global.compilerFactory.getNodeFromCompilerNode(compilerNode, thisNode.sourceFile);
}

function getWrappedCondition(thisNode: Node, condition: ((c: Node) => boolean) | undefined) {
    return condition == null ? undefined : ((c: ts.Node) => condition(getWrappedNode(thisNode, c)));
}
