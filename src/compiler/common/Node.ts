import {ts, SyntaxKind} from "./../../typescript";
import CodeBlockWriter from "code-block-writer";
import * as errors from "./../../errors";
import {GlobalContainer} from "./../../GlobalContainer";
import {IndentationText} from "./../../ManipulationSettings";
import {StructureToText} from "./../../structureToTexts";
import {insertIntoParentTextRange, getNextNonWhitespacePos, getPreviousMatchingPos, replaceSourceFileTextForFormatting,
    getTextFromFormattingEdits} from "./../../manipulation";
import {TypeGuards, getTextFromStringOrWriter, ArrayUtils, isStringKind, printNode, PrintNodeOptions} from "./../../utils";
import {SourceFile} from "./../file";
import {ConstructorDeclaration, MethodDeclaration} from "./../class";
import {FunctionDeclaration} from "./../function";
import {FormatCodeSettings} from "./../tools";
import {TypeAliasDeclaration, Type} from "./../type";
import {InterfaceDeclaration} from "./../interface";
import {QuoteType} from "./../literal/QuoteType";
import {NamespaceDeclaration} from "./../namespace";
import {Symbol} from "./Symbol";
import {SyntaxList} from "./SyntaxList";

export class Node<NodeType extends ts.Node = ts.Node> {
    /** @internal */
    readonly global: GlobalContainer;
    /** @internal */
    private _compilerNode: NodeType | undefined;
    /** @internal */
    private _childStringRanges: [number, number][] | undefined;
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
        if (global == null || global.compilerFactory == null)
            throw new errors.InvalidOperationError("Constructing a node is not supported. Please create a source file from the default export " +
                "of the package and manipulate the source file from there.");

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
     *
     * This will be true when the node was forgotten or removed.
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
        return SyntaxKind[this.compilerNode.kind];
    }

    /**
     * Prints the node using the compiler's printer.
     * @param options - Options.
     */
    print(options: PrintNodeOptions = {}): string {
        if (options.newLineKind == null)
            options.newLineKind = this.global.manipulationSettings.getNewLineKind();

        if (this.getKind() === SyntaxKind.SourceFile)
            return printNode(this.compilerNode, options);
        else
            return printNode(this.compilerNode, this.sourceFile.compilerNode, options);
    }

    /**
     * Gets the symbol or throws an error if it doesn't exist.
     */
    getSymbolOrThrow(): Symbol {
        return errors.throwIfNullOrUndefined(this.getSymbol(), "Could not find the node's symbol.");
    }

    /**
     * Gets the compiler symbol or undefined if it doesn't exist.
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
     * Gets the type of the node.
     */
    getType(): Type {
        return this.global.typeChecker.getTypeAtLocation(this);
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
     * Gets if the specified position is within a string.
     * @param pos - Position.
     */
    isInStringAtPos(pos: number) {
        errors.throwIfOutOfRange(pos, [this.getPos(), this.getEnd()], nameof(pos));

        if (this._childStringRanges == null) {
            this._childStringRanges = [];
            for (const descendant of this.getCompilerDescendantsIterator()) {
                if (isStringKind(descendant.kind))
                    this._childStringRanges.push([descendant.getStart(this.sourceFile.compilerNode), descendant.getEnd()]);
            }
        }

        return ArrayUtils.binarySearch(this._childStringRanges, range => range[0] < pos && pos < range[1] - 1, range => range[0] > pos) !== -1;
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
    getFirstChild(condition?: (node: Node) => boolean): Node | undefined {
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
    getLastChild(condition?: (node: Node) => boolean): Node | undefined {
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
    getPreviousSibling(condition?: (node: Node) => boolean): Node | undefined {
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
    getNextSibling(condition?: (node: Node) => boolean): Node | undefined {
        const nextSibling = this.getCompilerNextSibling(getWrappedCondition(this, condition));
        return nextSibling == null ? undefined : getWrappedNode(this, nextSibling);
    }

    /**
     * Gets the previous siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getPreviousSiblings(): Node[] {
        return this.getCompilerPreviousSiblings().map(n => getWrappedNode(this, n));
    }

    /**
     * Gets the next siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getNextSiblings(): Node[] {
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
    getChildAtIndex(index: number): Node {
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
            else if (child.kind === SyntaxKind.SyntaxList) {
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

        if (
            TypeGuards.isSourceFile(node) ||
            TypeGuards.isBodyableNode(this) ||
            TypeGuards.isBodiedNode(this) ||
            TypeGuards.isCaseBlock(this) ||
            TypeGuards.isCaseClause(this) ||
            TypeGuards.isDefaultClause(this)
        )
            return node.getFirstChildByKind(SyntaxKind.SyntaxList) as SyntaxList | undefined;

        let passedBrace = false;
        for (const child of node.getCompilerChildren()) {
            if (!passedBrace)
                passedBrace = child.kind === SyntaxKind.FirstPunctuation;
            else if (child.kind === SyntaxKind.SyntaxList)
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
     * @param includeJsDocComment - Whether to include the JS doc comment.
     */
    getStart(includeJsDocComment?: boolean) {
        // rare time a bool parameter will be used... it's because it's done in the ts compiler
        return this.compilerNode.getStart(this.sourceFile.compilerNode, includeJsDocComment);
    }

    /**
     * Gets the end position of the last significant token.
     */
    getFullStart() {
        return this.compilerNode.getFullStart();
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
     *
     * WARNING: This should only be called by the compiler factory!
     */
    replaceCompilerNodeFromFactory(compilerNode: NodeType) {
        this._compilerNode = compilerNode;
        this._childStringRanges = undefined;
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
    getNodeProperty<KeyType extends keyof NodeType>(propertyName: KeyType): Node {
        // todo: this method should use conditional types in TS 2.8 so that it maps the KeyType to the correct node property
        if ((this.compilerNode[propertyName] as any).kind == null)
            throw new errors.InvalidOperationError(`Attempted to get property '${propertyName}', but ${nameof<this>(n => n.getNodeProperty)} ` +
                `only works with properties that return a node.`);
        return getWrappedNode(this, this.compilerNode[propertyName] as any as ts.Node) as Node;
    }

    /**
     * Goes up the tree getting all the parents in ascending order.
     */
    getAncestors(): Node[];
    /**
     * @internal - This is internal for now. I'm not sure what the correct behaviour should be.
     */
    getAncestors(includeSyntaxLists: boolean): Node[];
    getAncestors(includeSyntaxLists = false) {
        return ArrayUtils.from(this.getAncestorsIterator(includeSyntaxLists));
    }

    /**
     * @internal
     */
    *getAncestorsIterator(includeSyntaxLists: boolean): IterableIterator<Node> {
        let parent = getParent(this);
        while (parent != null) {
            yield parent;
            parent = getParent(parent!);
        }

        function getParent(node: Node) {
            return includeSyntaxLists ? node.getParentSyntaxList() || node.getParent() : node.getParent();
        }
    }

    /**
     * Get the node's parent.
     */
    getParent(): Node | undefined {
        return this.compilerNode.parent == null ? undefined : getWrappedNode(this, this.compilerNode.parent);
    }

    /**
     * Gets the parent or throws an error if it doesn't exist.
     */
    getParentOrThrow() {
        return errors.throwIfNullOrUndefined(this.getParent(), "Expected to find a parent.");
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
    getParentWhileKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getParentWhileKind(kind), `The initial parent was not a syntax kind of ${SyntaxKind[kind]}.`);
    }

    /**
     * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
     * Returns undefined if the initial parent is not the specified syntax kind.
     * @param kind - Syntax kind to check for.
     */
    getParentWhileKind(kind: SyntaxKind) {
        return this.getParentWhile(n => n.getKind() === kind);
    }

    /**
     * Gets the last token of this node. Usually this is a close brace.
     */
    getLastToken(): Node {
        const lastToken = this.compilerNode.getLastToken(this.sourceFile.compilerNode);
        if (lastToken == null)
            throw new errors.NotImplementedError("Not implemented scenario where the last token does not exist.");

        return getWrappedNode(this, lastToken);
    }

    /**
     * Gets if this node is in a syntax list.
     */
    isInSyntaxList(): boolean {
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
    getParentSyntaxList(): Node | undefined {
        const parent = this.getParent();
        if (parent == null)
            return undefined;

        const pos = this.getPos();
        const end = this.getEnd();
        for (const child of parent.getCompilerChildren()) {
            if (child.pos > end || child === this.compilerNode)
                return undefined;

            if (child.kind === SyntaxKind.SyntaxList && child.pos <= pos && child.end >= end)
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
    getIndentationText(): string {
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
    getChildIndentationText(): string {
        if (TypeGuards.isSourceFile(this))
            return "";

        return this.getIndentationText() + this.global.manipulationSettings.getIndentationText();
    }

    /**
     * Gets the position of the start of the line that this node starts on.
     * @param includeJsDocComment - Whether to include the JS doc comment or not.
     */
    getStartLinePos(includeJsDocComment?: boolean) {
        const sourceFileText = this.sourceFile.getFullText();
        return getPreviousMatchingPos(sourceFileText, this.getStart(includeJsDocComment), char => char === "\n");
    }

    /**
     * Gets the line number at the start of the node.
     * @param includeJsDocComment - Whether to include the JS doc comment or not.
     */
    getStartLineNumber(includeJsDocComment?: boolean) {
        return this.sourceFile.getLineNumberFromPos(this.getStartLinePos(includeJsDocComment));
    }

    /**
     * Gets the line number of the end of the node.
     */
    getEndLineNumber() {
        const sourceFileText = this.sourceFile.getFullText();
        const endLinePos = getPreviousMatchingPos(sourceFileText, this.getEnd(), char => char === "\n");
        return this.sourceFile.getLineNumberFromPos(endLinePos);
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

        const start = this.getStart(true);
        insertIntoParentTextRange({
            parent,
            insertPos: start,
            newText,
            replacing: {
                textLength: this.getEnd() - start
            }
        });

        return parent.getChildren()[childIndex];
    }

    /**
     * Formats the node's text using the internal TypeScript formatting API.
     * @param settings - Format code settings.
     */
    formatText(settings: FormatCodeSettings = {}) {
        const formattingEdits = this.global.languageService.getFormattingEditsForRange(
            this.sourceFile.getFilePath(),
            [this.getStart(true), this.getEnd()],
            settings);

        replaceSourceFileTextForFormatting({
            sourceFile: this.sourceFile,
            newText: getTextFromFormattingEdits(this.sourceFile, formattingEdits)
        });
    }

    /**
     * Gets the children based on a kind.
     * @param kind - Syntax kind.
     */
    getChildrenOfKind(kind: SyntaxKind): Node[] {
        return this.getCompilerChildren().filter(c => c.kind === kind).map(c => getWrappedNode(this, c));
    }

    /**
     * Gets the first child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildByKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstChildByKind(kind), `A child of the kind ${SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the first child by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildByKind(kind: SyntaxKind): Node | undefined {
        const child = this.getCompilerFirstChild(c => c.kind === kind);
        return child == null ? undefined : getWrappedNode(this, child);
    }

    /**
     * Gets the first child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstChildIfKind(kind), `A first child of the kind ${SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the first child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKind(kind: SyntaxKind): Node | undefined {
        const firstChild = this.getCompilerFirstChild();
        return firstChild != null && firstChild.kind === kind ? getWrappedNode(this, firstChild) : undefined;
    }

    /**
     * Gets the last child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildByKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getLastChildByKind(kind), `A child of the kind ${SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the last child by syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildByKind(kind: SyntaxKind): Node | undefined {
        const lastChild = this.getCompilerLastChild(c => c.kind === kind);
        return lastChild == null ? undefined : getWrappedNode(this, lastChild);
    }

    /**
     * Gets the last child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildIfKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getLastChildIfKind(kind), `A last child of the kind ${SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the last child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildIfKind(kind: SyntaxKind): Node | undefined {
        const lastChild = this.getCompilerLastChild();
        return lastChild != null && lastChild.kind === kind ? getWrappedNode(this, lastChild) : undefined;
    }

    /**
     * Gets the child at the specified index if it's the specified kind or throws an exception.
     * @param index - Index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKindOrThrow(index: number, kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getChildAtIndexIfKind(index, kind), `Child at index ${index} was expected to be ${SyntaxKind[kind]}`);
    }

    /**
     * Gets the child at the specified index if it's the specified kind or returns undefined.
     * @param index - Index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKind(index: number, kind: SyntaxKind): Node | undefined {
        const node = this.getCompilerChildAtIndex(index);
        return node.kind === kind ? getWrappedNode(this, node) : undefined;
    }

    /**
     * Gets the previous sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getPreviousSiblingIfKind(kind), `A previous sibling of kind ${SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the next sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getNextSiblingIfKind(kind), `A next sibling of kind ${SyntaxKind[kind]} was expected.`);
    }

    /**
     * Gets the previous sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKind(kind: SyntaxKind): Node | undefined {
        const previousSibling = this.getCompilerPreviousSibling();
        return previousSibling != null && previousSibling.kind === kind ? getWrappedNode(this, previousSibling) : undefined;
    }

    /**
     * Gets the next sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKind(kind: SyntaxKind): Node | undefined {
        const nextSibling = this.getCompilerNextSibling();
        return nextSibling != null && nextSibling.kind === kind ? getWrappedNode(this, nextSibling) : undefined;
    }

    /**
     * Gets the parent if it's a certain syntax kind.
     */
    getParentIfKind(kind: SyntaxKind): Node | undefined {
        const parentNode = this.getParent();
        return parentNode == null || parentNode.getKind() !== kind ? undefined : parentNode;
    }

    /**
     * Gets the parent if it's a certain syntax kind of throws.
     */
    getParentIfKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getParentIfKind(kind), `Expected a parent with a syntax kind of ${SyntaxKind[kind]}.`);
    }

    /**
     * Gets the first ancestor by syntax kind or throws if not found.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstAncestorByKind(kind), `Expected an ancestor with a syntax kind of ${SyntaxKind[kind]}.`);
    }

    /**
     * Get the first ancestor by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKind(kind: SyntaxKind): Node | undefined {
        for (const parent of this.getAncestors(kind === SyntaxKind.SyntaxList)) {
            if (parent.getKind() === kind)
                return parent;
        }
        return undefined;
    }

    /**
     * Gets the descendants that match a specified syntax kind.
     * @param kind - Kind to check.
     */
    getDescendantsOfKind(kind: SyntaxKind) {
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
    getFirstDescendantByKindOrThrow(kind: SyntaxKind) {
        return errors.throwIfNullOrUndefined(this.getFirstDescendantByKind(kind), `A descendant of kind ${SyntaxKind[kind]} is required to do this operation.`);
    }

    /**
     * Gets the first descendant by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstDescendantByKind(kind: SyntaxKind): Node | undefined {
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
     * Gets a writer with the indentation text.
     * @internal
     */
    getWriterWithIndentation() {
        const writer = this.getWriter();
        writer.setIndentationLevel(this.getIndentationText());
        return writer;
    }

    /**
     * Gets a writer with the child indentation text.
     * @internal
     */
    getWriterWithChildIndentation() {
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
            newLine: this.global.manipulationSettings.getNewLineKindAsString(),
            indentNumberOfSpaces: indentationText === IndentationText.Tab ? undefined : indentationText.length,
            useTabs: indentationText === IndentationText.Tab,
            useSingleQuote: this.global.manipulationSettings.getQuoteType() === QuoteType.Single
        });
    }

    /**
     * Gets or creates a node from the internal cache.
     * @internal
     */
    getNodeFromCompilerNode<LocalNodeType extends Node<LocalCompilerNodeType>, LocalCompilerNodeType extends ts.Node = ts.Node>(
        compilerNode: LocalCompilerNodeType): LocalNodeType
    {
        return this.global.compilerFactory.getNodeFromCompilerNode(compilerNode, this.sourceFile) as LocalNodeType;
    }

    /**
     * Gets or creates a node from the internal cache, if it exists.
     * @internal
     */
    getNodeFromCompilerNodeIfExists<LocalNodeType extends Node<LocalCompilerNodeType>, LocalCompilerNodeType extends ts.Node = ts.Node>(
        compilerNode: LocalCompilerNodeType | undefined): LocalNodeType | undefined
    {
        return compilerNode == null ? undefined : this.getNodeFromCompilerNode<LocalNodeType, LocalCompilerNodeType>(compilerNode);
    }
}

function getWrappedNode(thisNode: Node, compilerNode: ts.Node): Node {
    return thisNode.global.compilerFactory.getNodeFromCompilerNode(compilerNode, thisNode.sourceFile);
}

function getWrappedCondition(thisNode: Node, condition: ((c: Node) => boolean) | undefined): ((c: ts.Node) => boolean) | undefined {
    return condition == null ? undefined : ((c: ts.Node) => condition(getWrappedNode(thisNode, c)));
}
