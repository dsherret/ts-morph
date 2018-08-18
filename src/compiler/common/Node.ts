import { CodeBlockWriter } from "../../codeBlockWriter";
import * as errors from "../../errors";
import { ProjectContext } from "../../ProjectContext";
import { getNextMatchingPos, getNextNonWhitespacePos, getPreviousMatchingPos, getTextFromFormattingEdits, insertIntoParentTextRange,
    replaceSourceFileTextForFormatting } from "../../manipulation";
import { WriterFunction } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, getParentSyntaxList, getSyntaxKindName, getTextFromStringOrWriter, isStringKind, printNode, PrintNodeOptions, StringUtils,
    TypeGuards, StoredComparer } from "../../utils";
import { CompilerNodeToWrappedType } from "../CompilerNodeToWrappedType";
import { SourceFile } from "../file";
import { KindToNodeMappings } from "../kindToNodeMappings";
import { Statement } from "../statement";
import { FormatCodeSettings } from "../tools";
import { Type } from "../type";
import { CommentRange } from "./CommentRange";
import { Symbol } from "./Symbol";
import { SyntaxList } from "./SyntaxList";

export interface ForEachChildTraversalControl {
    /**
     * Stops traversal.
     */
    stop(): void;
}

export interface ForEachDescendantTraversalControl extends ForEachChildTraversalControl {
    /**
     * Skips traversal of the current node's descendants.
     */
    skip(): void;
    /**
     * Skips traversal of the current node, siblings, and all their descendants.
     */
    up(): void;
}

export type NodePropertyToWrappedType<NodeType extends ts.Node, KeyName extends keyof NodeType, NonNullableNodeType = NonNullable<NodeType[KeyName]>> =
    NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeTypeForNullable> | undefined ? CompilerNodeToWrappedType<ArrayNodeTypeForNullable>[] | undefined :
    NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeType> ? CompilerNodeToWrappedType<ArrayNodeType>[] :
    NodeType[KeyName] extends ts.Node ? CompilerNodeToWrappedType<NodeType[KeyName]> :
    NonNullableNodeType extends ts.Node ? CompilerNodeToWrappedType<NonNullableNodeType> | undefined :
    NodeType[KeyName];

export type NodeParentType<NodeType extends ts.Node> =
    NodeType extends ts.SourceFile ? CompilerNodeToWrappedType<NodeType["parent"]> | undefined :
    ts.Node extends NodeType ? CompilerNodeToWrappedType<NodeType["parent"]> | undefined :
    CompilerNodeToWrappedType<NodeType["parent"]>;

export class Node<NodeType extends ts.Node = ts.Node> {
    /** @internal */
    readonly context: ProjectContext;
    /** @internal */
    private _compilerNode: NodeType | undefined;
    /** @internal */
    private _childStringRanges: [number, number][] | undefined;
    /** @internal */
    private _leadingCommentRanges: CommentRange[] | undefined;
    /** @internal */
    private _trailingCommentRanges: CommentRange[] | undefined;
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
     * @param context - Project context.
     * @param node - Underlying node.
     * @param sourceFile - Source file for the node.
     */
    constructor(
        context: ProjectContext,
        node: NodeType,
        sourceFile: SourceFile
    ) {
        if (context == null || context.compilerFactory == null)
            throw new errors.InvalidOperationError("Constructing a node is not supported. Please create a source file from the default export " +
                "of the package and manipulate the source file from there.");

        this.context = context;
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

        this.context.compilerFactory.removeNodeFromCache(this);
        this._clearInternals();
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
     * @internal
     *
     * WARNING: This should only be called by the compiler factory!
     */
    replaceCompilerNodeFromFactory(compilerNode: NodeType) {
        this._clearInternals();
        this._compilerNode = compilerNode;
    }

    /** @internal */
    private _clearInternals() {
        this._compilerNode = undefined;
        this._childStringRanges = undefined;
        clearCommentRanges(this._leadingCommentRanges);
        clearCommentRanges(this._trailingCommentRanges);
        this._leadingCommentRanges = undefined;
        this._trailingCommentRanges = undefined;

        function clearCommentRanges(commentRanges: CommentRange[] | undefined) {
            if (commentRanges == null)
                return;
            commentRanges.forEach(r => r.forget());
        }
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
        return getSyntaxKindName(this.compilerNode.kind);
    }

    /**
     * Prints the node using the compiler's printer.
     * @param options - Options.
     */
    print(options: PrintNodeOptions = {}): string {
        if (options.newLineKind == null)
            options.newLineKind = this.context.manipulationSettings.getNewLineKind();

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
            return this.context.compilerFactory.getSymbol(boundSymbol);

        const typeChecker = this.context.typeChecker;
        const typeCheckerSymbol = typeChecker.getSymbolAtLocation(this);
        if (typeCheckerSymbol != null)
            return typeCheckerSymbol;

        const nameNode = (this.compilerNode as any).name as ts.Node | undefined;
        if (nameNode != null)
            return this.getNodeFromCompilerNode(nameNode).getSymbol();

        return undefined;
    }

    /**
     * Gets the type of the node.
     */
    getType(): Type {
        return this.context.typeChecker.getTypeAtLocation(this);
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

        class InStringRangeComparer implements StoredComparer<[number, number]> {
            compareTo(value: [number, number]) {
                if (pos <= value[0])
                    return -1;
                if (pos >= value[1] - 1)
                    return 1;
                return 0;
            }
        }

        return ArrayUtils.binarySearch(this._childStringRanges, new InStringRangeComparer()) !== -1;
    }

    /**
     * Gets the first child by a condition or throws.
     * @param condition - Condition.
     */
    getFirstChildOrThrow<T extends Node>(condition?: (node: Node) => node is T): T;
    /**
     * Gets the first child by a condition or throws.
     * @param condition - Condition.
     */
    getFirstChildOrThrow(condition?: (node: Node) => boolean): Node;
    getFirstChildOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getFirstChild(condition), "Could not find a child that matched the specified condition.");
    }

    /**
     * Gets the first child by a condition.
     * @param condition - Condition.
     */
    getFirstChild<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
    /**
     * Gets the first child by a condition.
     * @param condition - Condition.
     */
    getFirstChild(condition?: (node: Node) => boolean): Node | undefined;
    getFirstChild(condition?: (node: Node) => boolean) {
        const firstChild = this.getCompilerFirstChild(getWrappedCondition(this, condition));
        return this.getNodeFromCompilerNodeIfExists(firstChild);
    }

    /**
     * Gets the last child by a condition or throws.
     * @param condition - Condition.
     */
    getLastChildOrThrow<T extends Node>(condition?: (node: Node) => node is T): T;
    /**
     * Gets the last child by a condition or throws.
     * @param condition - Condition.
     */
    getLastChildOrThrow(condition?: (node: Node) => boolean): Node;
    getLastChildOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getLastChild(condition), "Could not find a child that matched the specified condition.");
    }

    /**
     * Gets the last child by a condition.
     * @param condition - Condition.
     */
    getLastChild<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
    /**
     * Gets the last child by a condition.
     * @param condition - Condition.
     */
    getLastChild(condition?: (node: Node) => boolean): Node | undefined;
    getLastChild(condition?: (node: Node) => boolean): Node | undefined {
        const lastChild = this.getCompilerLastChild(getWrappedCondition(this, condition));
        return this.getNodeFromCompilerNodeIfExists(lastChild);
    }

    /**
     * Gets the first descendant by a condition or throws.
     * @param condition - Condition.
     */
    getFirstDescendantOrThrow<T extends Node>(condition?: (node: Node) => node is T): T;
    /**
     * Gets the first descendant by a condition or throws.
     * @param condition - Condition.
     */
    getFirstDescendantOrThrow(condition?: (node: Node) => boolean): Node;
    getFirstDescendantOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getFirstDescendant(condition), "Could not find a descendant that matched the specified condition.");
    }

    /**
     * Gets the first descendant by a condition.
     * @param condition - Condition.
     */
    getFirstDescendant<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
    /**
     * Gets the first descendant by a condition.
     * @param condition - Condition.
     */
    getFirstDescendant(condition?: (node: Node) => boolean): Node | undefined;
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
    getPreviousSiblingOrThrow<T extends Node>(condition?: (node: Node) => node is T): T;
    /**
     * Gets the previous sibling or throws.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getPreviousSiblingOrThrow(condition?: (node: Node) => boolean): Node;
    getPreviousSiblingOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getPreviousSibling(condition), "Could not find the previous sibling.");
    }

    /**
     * Gets the previous sibling.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getPreviousSibling<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
    /**
     * Gets the previous sibling.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getPreviousSibling(condition?: (node: Node) => boolean): Node | undefined;
    getPreviousSibling(condition?: (node: Node) => boolean): Node | undefined {
        const previousSibling = this.getCompilerPreviousSibling(getWrappedCondition(this, condition));
        return this.getNodeFromCompilerNodeIfExists(previousSibling);
    }

    /**
     * Gets the next sibling or throws.
     * @param condition - Optional condition for getting the next sibling.
     */
    getNextSiblingOrThrow<T extends Node>(condition?: (node: Node) => node is T): T;
    /**
     * Gets the next sibling or throws.
     * @param condition - Optional condition for getting the next sibling.
     */
    getNextSiblingOrThrow(condition?: (node: Node) => boolean): Node;
    getNextSiblingOrThrow(condition?: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getNextSibling(condition), "Could not find the next sibling.");
    }

    /**
     * Gets the next sibling.
     * @param condition - Optional condition for getting the next sibling.
     */
    getNextSibling<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
    /**
     * Gets the next sibling.
     * @param condition - Optional condition for getting the next sibling.
     */
    getNextSibling(condition?: (node: Node) => boolean): Node | undefined;
    getNextSibling(condition?: (node: Node) => boolean): Node | undefined {
        const nextSibling = this.getCompilerNextSibling(getWrappedCondition(this, condition));
        return this.getNodeFromCompilerNodeIfExists(nextSibling);
    }

    /**
     * Gets the previous siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getPreviousSiblings(): Node[] {
        return this.getCompilerPreviousSiblings().map(n => this.getNodeFromCompilerNode(n));
    }

    /**
     * Gets the next siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getNextSiblings(): Node[] {
        return this.getCompilerNextSiblings().map(n => this.getNodeFromCompilerNode(n));
    }

    /**
     * Gets all the children of the node.
     */
    getChildren(): Node[] {
        return this.getCompilerChildren().map(n => this.getNodeFromCompilerNode(n));
    }

    /**
     * Gets the child at the specified index.
     * @param index - Index of the child.
     */
    getChildAtIndex(index: number): Node {
        return this.getNodeFromCompilerNode(this.getCompilerChildAtIndex(index));
    }

    /**
     * @internal
     */
    *getChildrenIterator(): IterableIterator<Node> {
        for (const compilerChild of this.getCompilerChildren())
            yield this.getNodeFromCompilerNode(compilerChild);
    }

    /**
     * @internal
     */
    *getChildrenInCacheIterator(): IterableIterator<Node> {
        for (const child of this.getCompilerChildren()) {
            if (this.context.compilerFactory.hasCompilerNode(child))
                yield this.context.compilerFactory.getExistingCompilerNode(child)!;
            else if (child.kind === SyntaxKind.SyntaxList) {
                // always return syntax lists because their children could be in the cache
                yield this.getNodeFromCompilerNode(child);
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
            TypeGuards.isDefaultClause(this) ||
            TypeGuards.isJsxElement(this)
        )
            return node.getFirstChildByKind(SyntaxKind.SyntaxList);

        let passedBrace = false;
        for (const child of node.getCompilerChildren()) {
            if (!passedBrace)
                passedBrace = child.kind === SyntaxKind.OpenBraceToken;
            else if (child.kind === SyntaxKind.SyntaxList)
                return this.getNodeFromCompilerNode(child) as SyntaxList;
        }

        return undefined;
    }

    /**
     * Invokes the `cbNode` callback for each child and the `cbNodeArray` for every array of nodes stored in properties of the node.
     * If `cbNodeArray` is not defined, then it will pass every element of the array to `cbNode`.
     *
     * @remarks There exists a `traversal.stop()` function on the second parameter that allows stopping iteration.
     * @param cbNode - Callback invoked for each child.
     * @param cbNodeArray - Callback invoked for each array of nodes.
     */
    forEachChild(cbNode: (node: Node, traversal: ForEachChildTraversalControl) => void, cbNodeArray?: (nodes: Node[], traversal: ForEachChildTraversalControl) => void) {
        let stop = false;
        const traversal: ForEachChildTraversalControl = {
            stop: () => stop = true
        };
        const snapshots: (Node | Node[])[] = [];

        // Get all the nodes from the compiler's forEachChild. Taking this snapshot prevents the results of
        // .forEachChild from returning out of date nodes due to a manipulation or deletion
        this.compilerNode.forEachChild(node => {
            // use function block to ensure a truthy value is not returned
            snapshots.push(this.getNodeFromCompilerNode(node));
        }, cbNodeArray == null ? undefined : nodes => {
            snapshots.push(nodes.map(n => this.getNodeFromCompilerNode(n)));
        });

        // now send them to the user
        for (const snapshot of snapshots) {
            if (snapshot instanceof Array) {
                const filteredNodes = snapshot.filter(n => !n.wasForgotten());
                if (filteredNodes.length > 0)
                    cbNodeArray!(filteredNodes, traversal);
            }
            else if (!snapshot.wasForgotten())
                cbNode(snapshot, traversal);

            if (stop)
                break;
        }
    }

    /**
     * Invokes the `cbNode` callback for each descendant and the `cbNodeArray` for every array of nodes stored in properties of the node and descendant nodes.
     * If `cbNodeArray` is not defined, then it will pass every element of the array to `cbNode`.
     *
     * @remarks There exists a `traversal` object on the second parameter that allows various control of iteration.
     * @param cbNode - Callback invoked for each descendant.
     * @param cbNodeArray - Callback invoked for each array of nodes.
     */
    forEachDescendant(cbNode: (node: Node, traversal: ForEachDescendantTraversalControl) => void, cbNodeArray?: (nodes: Node[], traversal: ForEachDescendantTraversalControl) => void) {
        let stop = false;
        let up = false;
        const traversal = {
            stop: () => stop = true,
            up: () => up = true
        };
        const nodeCallback = (node: Node) => {
            if (stop)
                return;

            let skip = false;

            cbNode(node, {
                ...traversal,
                skip: () => skip = true
            });

            if (stop || skip || up)
                return;

            forEachChildForNode(node);
        };
        const arrayCallback = cbNodeArray == null ? undefined : (nodes: Node[]) => {
            if (stop)
                return;

            let skip = false;

            cbNodeArray(nodes, {
                ...traversal,
                skip: () => skip = true
            });

            if (skip)
                return;

            for (const node of nodes) {
                if (stop || up)
                    return;

                forEachChildForNode(node);
            }
        };

        forEachChildForNode(this);

        function forEachChildForNode(node: Node) {
            node.forEachChild((innerNode, innerTraversal) => {
                nodeCallback(innerNode);
                if (up) {
                    innerTraversal.stop();
                    up = false;
                }
            }, arrayCallback == null ? undefined : (nodes, innerTraversal) => {
                arrayCallback(nodes);
                if (up) {
                    innerTraversal.stop();
                    up = false;
                }
            });
        }
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
            yield this.getNodeFromCompilerNode(descendant);
    }

    /**
     * Gets the node's descendant statements.
     */
    getDescendantStatements(): Statement[] {
        type NodeWithStatements = ts.Node & { statements: ts.NodeArray<ts.Statement>; };
        const statements: Statement[] = [];

        handleNode(this, this.compilerNode);

        return statements;

        function handleNode(thisNode: Node, node: ts.Node) {
            if (handleStatements(thisNode, node))
                return;
            else if (node.kind === SyntaxKind.ArrowFunction) {
                const arrowFunction = (node as ts.ArrowFunction);
                if (arrowFunction.body.kind !== SyntaxKind.Block)
                    statements.push(thisNode.getNodeFromCompilerNode(arrowFunction.body) as Node as Statement); // todo: bug... it's not a statement
                else
                    handleNode(thisNode, arrowFunction.body);
            }
            else
                handleChildren(thisNode, node);
        }

        function handleStatements(thisNode: Node, node: ts.Node) {
            if ((node as NodeWithStatements).statements == null)
                return false;
            for (const statement of (node as NodeWithStatements).statements) {
                statements.push(thisNode.getNodeFromCompilerNode(statement));
                handleChildren(thisNode, statement);
            }
            return true;
        }

        function handleChildren(thisNode: Node, node: ts.Node) {
            ts.forEachChild(node, childNode => handleNode(thisNode, childNode));
        }
    }

    /**
     * Gets the number of children the node has.
     */
    getChildCount() {
        return this.compilerNode.getChildCount(this.sourceFile.compilerNode);
    }

    /**
     * Gets the child at the provided text position, or undefined if not found.
     * @param pos - Text position to search for.
     */
    getChildAtPos(pos: number): Node | undefined {
        if (pos < this.getPos() || pos >= this.getEnd())
            return undefined;

        for (const child of this.getCompilerChildren()) {
            if (pos >= child.pos && pos < child.end)
                return this.getNodeFromCompilerNode(child);
        }

        return undefined;
    }

    /**
     * Gets the most specific descendant at the provided text position, or undefined if not found.
     * @param pos - Text position to search for.
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
     * Gets the most specific descendant at the provided start text position with the specified width, or undefined if not found.
     * @param start - Start text position to search for.
     * @param width - Text length of the node to search for.
     */
    getDescendantAtStartWithWidth(start: number, width: number): Node | undefined {
        let foundNode: Node | undefined;

        this.context.compilerFactory.forgetNodesCreatedInBlock(remember => {
            let nextNode: Node | undefined = this.getSourceFile();

            do {
                nextNode = nextNode.getChildAtPos(start);
                if (nextNode != null) {
                    if (nextNode.getStart() === start && nextNode.getWidth() === width)
                        foundNode = nextNode;
                    else if (foundNode != null)
                        break; // no need to keep looking
                }
            } while (nextNode != null);

            if (foundNode != null)
                remember(foundNode);
        });

        return foundNode;
    }

    /**
     * Gets the source file text position where the node starts that includes the leading trivia (comments and whitespace).
     */
    getPos() {
        return this.compilerNode.pos;
    }

    /**
     * Gets the source file text position where the node ends.
     *
     * @remarks This does not include the following trivia (comments and whitespace).
     */
    getEnd() {
        return this.compilerNode.end;
    }

    /**
     * Gets the source file text position where the node starts that does not include the leading trivia (comments and whitespace).
     * @param includeJsDocComment - Whether to include the JS doc comment.
     */
    getStart(includeJsDocComment?: boolean) {
        // rare time a bool parameter will be used... it's because it's done in the ts compiler
        return this.compilerNode.getStart(this.sourceFile.compilerNode, includeJsDocComment);
    }

    /**
     * Gets the source file text position of the end of the last significant token or the start of the source file.
     */
    getFullStart() {
        return this.compilerNode.getFullStart();
    }

    /**
     * Gets the first source file text position from the result of .getPos() that is not whitespace.
     */
    getNonWhitespaceStart() {
        return getNextNonWhitespacePos(this.sourceFile.getFullText(), this.getPos());
    }

    /**
     * Gets the text length of the node without trivia.
     */
    getWidth() {
        return this.compilerNode.getWidth(this.sourceFile.compilerNode);
    }

    /**
     * Gets the text length of the node with trivia.
     */
    getFullWidth() {
        return this.compilerNode.getFullWidth();
    }

    /**
     * Gets the node's leading trivia's text length.
     */
    getLeadingTriviaWidth() {
        return this.compilerNode.getLeadingTriviaWidth(this.sourceFile.compilerNode);
    }

    /**
     * Gets the text length from the end of the current node to the next significant token or new line.
     */
    getTrailingTriviaWidth() {
        return this.getTrailingTriviaEnd() - this.getEnd();
    }

    /**
     * Gets the text position of the next significant token or new line.
     */
    getTrailingTriviaEnd() {
        const parent = this.getParent();
        const end = this.getEnd();
        if (parent == null)
            return end;
        const parentEnd = parent.getEnd();
        if (parentEnd === end)
            return end;
        const trailingComments = this.getTrailingCommentRanges();
        const searchStart = getSearchStart();

        return getNextMatchingPos(this.sourceFile.getFullText(), searchStart, char => char !== " " && char !== "\t");

        function getSearchStart() {
            return trailingComments.length > 0 ? trailingComments[trailingComments.length - 1].getEnd() : end;
        }
    }

    /**
     * Gets the text without leading trivia (comments and whitespace).
     */
    getText() {
        return this.compilerNode.getText(this.sourceFile.compilerNode);
    }

    /**
     * Gets the full text with leading trivia (comments and whitespace).
     */
    getFullText() {
        return this.compilerNode.getFullText(this.sourceFile.compilerNode);
    }

    /**
     * Gets the combined modifier flags.
     */
    getCombinedModifierFlags() {
        // todo: make this method only available on declarations in the future.
        return ts.getCombinedModifierFlags(this.compilerNode as any as ts.Declaration);
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
    getNodeProperty<
        KeyType extends keyof LocalNodeType,
        LocalNodeType extends ts.Node = NodeType // necessary to make the compiler less strict when assigning "this" to Node<NodeType>
        >(propertyName: KeyType): NodePropertyToWrappedType<LocalNodeType, KeyType> {
        const property = (this.compilerNode as any)[propertyName] as any | any[];

        if (property == null)
            return undefined as any;
        else if (property instanceof Array)
            return property.map(p => isNode(p) ? this.getNodeFromCompilerNode(p) : p) as any;
        else if (isNode(property))
            return this.getNodeFromCompilerNode(property) as any;
        else
            return property;

        function isNode(value: any): value is ts.Node {
            return typeof value.kind === "number" && typeof value.pos === "number" && typeof value.end === "number";
        }
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
    getParent<T extends Node | undefined = NodeParentType<NodeType>>() {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.parent) as T;
    }

    /**
     * Gets the parent or throws an error if it doesn't exist.
     */
    getParentOrThrow<T extends Node | undefined = NodeParentType<NodeType>>() {
        return errors.throwIfNullOrUndefined(this.getParent<T>(), "Expected to find a parent.") as NonNullable<T>;
    }

    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Throws if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhileOrThrow<T extends Node>(condition: (node: Node) => node is T): T;
    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Throws if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhileOrThrow(condition: (node: Node) => boolean): Node;
    getParentWhileOrThrow(condition: (node: Node) => boolean) {
        return errors.throwIfNullOrUndefined(this.getParentWhile(condition), "The initial parent did not match the provided condition.");
    }

    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Returns undefined if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhile<T extends Node>(condition: (node: Node) => node is T): T | undefined;
    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Returns undefined if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhile(condition: (node: Node) => boolean): Node | undefined;
    getParentWhile(condition: (node: Node) => boolean) {
        let node: Node | undefined = undefined;
        let nextParent: Node | undefined = this.getParent();
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
    getParentWhileKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getParentWhileKind(kind), `The initial parent was not a syntax kind of ${getSyntaxKindName(kind)}.`);
    }

    /**
     * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
     * Returns undefined if the initial parent is not the specified syntax kind.
     * @param kind - Syntax kind to check for.
     */
    getParentWhileKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        return this.getParentWhile(n => n.getKind() === kind);
    }

    /**
     * Gets the last token of this node. Usually this is a close brace.
     */
    getLastToken(): Node {
        const lastToken = this.compilerNode.getLastToken(this.sourceFile.compilerNode);
        if (lastToken == null)
            throw new errors.NotImplementedError("Not implemented scenario where the last token does not exist.");

        return this.getNodeFromCompilerNode(lastToken);
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
        const syntaxList = getParentSyntaxList(this.compilerNode);
        return this.getNodeFromCompilerNodeIfExists(syntaxList);
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
     * Gets the indentation level of the current node.
     */
    getIndentationLevel() {
        const indentationText = this.context.manipulationSettings.getIndentationText();
        return this.context.languageService.getIdentationAtPosition(this.sourceFile, this.getStart()) / indentationText.length;
    }

    /**
     * Gets the child indentation level of the current node.
     */
    getChildIndentationLevel(): number {
        if (TypeGuards.isSourceFile(this))
            return 0;

        return this.getIndentationLevel() + 1;
    }

    /**
     * Gets the indentation text.
     * @param offset - Optional number of levels of indentation to add or remove.
     */
    getIndentationText(offset = 0): string {
        return this._getIndentationTextForLevel(this.getIndentationLevel() + offset);
    }

    /**
     * Gets the next indentation level text.
     * @param offset - Optional number of levels of indentation to add or remove.
     */
    getChildIndentationText(offset = 0): string {
        return this._getIndentationTextForLevel(this.getChildIndentationLevel() + offset);
    }

    /**
     * @internal
     */
    private _getIndentationTextForLevel(level: number) {
        return StringUtils.repeat(this.context.manipulationSettings.getIndentationText(), level);
    }

    /**
     * Gets the position of the start of the line that this node starts on.
     * @param includeJsDocComment - Whether to include the JS doc comment or not.
     */
    getStartLinePos(includeJsDocComment?: boolean) {
        const sourceFileText = this.sourceFile.getFullText();
        return getPreviousMatchingPos(sourceFileText, this.getStart(includeJsDocComment), char => char === "\n" || char === "\r");
    }

    /**
     * Gets the line number at the start of the node.
     * @param includeJsDocComment - Whether to include the JS doc comment or not.
     */
    getStartLineNumber(includeJsDocComment?: boolean) {
        return this.sourceFile.getLineNumberAtPos(this.getStartLinePos(includeJsDocComment));
    }

    /**
     * Gets the line number of the end of the node.
     */
    getEndLineNumber() {
        const sourceFileText = this.sourceFile.getFullText();
        const endLinePos = getPreviousMatchingPos(sourceFileText, this.getEnd(), char => char === "\n" || char === "\r");
        return this.sourceFile.getLineNumberAtPos(endLinePos);
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
     * @param textOrWriterFunction - Text or writer function to replace with.
     * @returns The new node.
     */
    replaceWithText(textOrWriterFunction: string | WriterFunction): Node;
    /** @internal */
    replaceWithText(textOrWriterFunction: string | WriterFunction, writer: CodeBlockWriter): Node;
    replaceWithText(textOrWriterFunction: string | WriterFunction, writer?: CodeBlockWriter): Node {
        const newText = getTextFromStringOrWriter(writer || this.getWriter(), textOrWriterFunction);
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
     * Prepends the specified whitespace to current node.
     * @param textOrWriterFunction - Text or writer function.
     */
    prependWhitespace(textOrWriterFunction: string | WriterFunction) {
        insertWhiteSpaceTextAtPos(this, this.getStart(true), textOrWriterFunction, nameof(this.prependWhitespace));
    }

    /**
     * Appends the specified whitespace to current node.
     * @param textOrWriterFunction - Text or writer function.
     */
    appendWhitespace(textOrWriterFunction: string | WriterFunction) {
        insertWhiteSpaceTextAtPos(this, this.getEnd(), textOrWriterFunction, nameof(this.appendWhitespace));
    }

    /**
     * Formats the node's text using the internal TypeScript formatting API.
     * @param settings - Format code settings.
     */
    formatText(settings: FormatCodeSettings = {}) {
        const formattingEdits = this.context.languageService.getFormattingEditsForRange(
            this.sourceFile.getFilePath(),
            [this.getStart(true), this.getEnd()],
            settings);

        replaceSourceFileTextForFormatting({
            sourceFile: this.sourceFile,
            newText: getTextFromFormattingEdits(this.sourceFile, formattingEdits)
        });
    }

    /**
     * Gets the leading comment ranges of the current node.
     */
    getLeadingCommentRanges(): CommentRange[] {
        return this._leadingCommentRanges || (this._leadingCommentRanges = this._getCommentsAtPos(this.getFullStart(), ts.getLeadingCommentRanges));
    }

    /**
     * Gets the trailing comment ranges of the current node.
     */
    getTrailingCommentRanges(): CommentRange[] {
        return this._trailingCommentRanges || (this._trailingCommentRanges = this._getCommentsAtPos(this.getEnd(), ts.getTrailingCommentRanges));
    }

    /** @internal */
    private _getCommentsAtPos(pos: number, getComments: (text: string, pos: number) => ts.CommentRange[] | undefined) {
        if (this.getKind() === SyntaxKind.SourceFile)
            return [];

        return (getComments(this.sourceFile.getFullText(), pos) || []).map(r => new CommentRange(r, this.sourceFile));
    }

    /**
     * Gets the children based on a kind.
     * @param kind - Syntax kind.
     */
    getChildrenOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][] {
        return this.getCompilerChildren().filter(c => c.kind === kind).map(c => this.getNodeFromCompilerNode(c));
    }

    /**
     * Gets the first child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getFirstChildByKind(kind), `A child of the kind ${getSyntaxKindName(kind)} was expected.`);
    }

    /**
     * Gets the first child by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        const child = this.getCompilerFirstChild(c => c.kind === kind);
        return child == null ? undefined : this.getNodeFromCompilerNode(child);
    }

    /**
     * Gets the first child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] {
        return errors.throwIfNullOrUndefined(this.getFirstChildIfKind(kind), `A first child of the kind ${getSyntaxKindName(kind)} was expected.`);
    }

    /**
     * Gets the first child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        const firstChild = this.getCompilerFirstChild();
        return firstChild != null && firstChild.kind === kind ? this.getNodeFromCompilerNode(firstChild) : undefined;
    }

    /**
     * Gets the last child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getLastChildByKind(kind), `A child of the kind ${getSyntaxKindName(kind)} was expected.`);
    }

    /**
     * Gets the last child by syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        const lastChild = this.getCompilerLastChild(c => c.kind === kind);
        return this.getNodeFromCompilerNodeIfExists(lastChild);
    }

    /**
     * Gets the last child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getLastChildIfKind(kind), `A last child of the kind ${getSyntaxKindName(kind)} was expected.`);
    }

    /**
     * Gets the last child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        const lastChild = this.getCompilerLastChild();
        return lastChild != null && lastChild.kind === kind ? this.getNodeFromCompilerNode(lastChild) : undefined;
    }

    /**
     * Gets the child at the specified index if it's the specified kind or throws an exception.
     * @param index - Child index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKindOrThrow<TKind extends SyntaxKind>(index: number, kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getChildAtIndexIfKind(index, kind), `Child at index ${index} was expected to be ${getSyntaxKindName(kind)}`);
    }

    /**
     * Gets the child at the specified index if it's the specified kind or returns undefined.
     * @param index - Child index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKind<TKind extends SyntaxKind>(index: number, kind: TKind): KindToNodeMappings[TKind] | undefined {
        const node = this.getCompilerChildAtIndex(index);
        return node.kind === kind ? this.getNodeFromCompilerNode(node) : undefined;
    }

    /**
     * Gets the previous sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getPreviousSiblingIfKind(kind), `A previous sibling of kind ${getSyntaxKindName(kind)} was expected.`);
    }

    /**
     * Gets the next sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getNextSiblingIfKind(kind), `A next sibling of kind ${getSyntaxKindName(kind)} was expected.`);
    }

    /**
     * Gets the previous sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        const previousSibling = this.getCompilerPreviousSibling();
        return previousSibling != null && previousSibling.kind === kind ? this.getNodeFromCompilerNode(previousSibling) : undefined;
    }

    /**
     * Gets the next sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        const nextSibling = this.getCompilerNextSibling();
        return nextSibling != null && nextSibling.kind === kind ? this.getNodeFromCompilerNode(nextSibling) : undefined;
    }

    /**
     * Gets the parent if it's a certain syntax kind.
     */
    getParentIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        const parentNode = this.getParent();
        return parentNode == null || parentNode.getKind() !== kind ? undefined : parentNode;
    }

    /**
     * Gets the parent if it's a certain syntax kind of throws.
     */
    getParentIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] {
        return errors.throwIfNullOrUndefined(this.getParentIfKind(kind), `Expected a parent with a syntax kind of ${getSyntaxKindName(kind)}.`);
    }

    /**
     * Gets the first ancestor by syntax kind or throws if not found.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] {
        return errors.throwIfNullOrUndefined(this.getFirstAncestorByKind(kind), `Expected an ancestor with a syntax kind of ${getSyntaxKindName(kind)}.`);
    }

    /**
     * Get the first ancestor by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
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
    getDescendantsOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][] {
        const descendants: Node[] = [];
        for (const descendant of this.getCompilerDescendantsIterator()) {
            if (descendant.kind === kind)
                descendants.push(this.getNodeFromCompilerNode(descendant));
        }
        return descendants;
    }

    /**
     * Gets the first descendant by syntax kind or throws.
     * @param kind - Syntax kind.
     */
    getFirstDescendantByKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
        return errors.throwIfNullOrUndefined(this.getFirstDescendantByKind(kind), `A descendant of kind ${getSyntaxKindName(kind)} was expected to be found.`);
    }

    /**
     * Gets the first descendant by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstDescendantByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
        for (const descendant of this.getCompilerDescendantsIterator()) {
            if (descendant.kind === kind)
                return this.getNodeFromCompilerNode(descendant);
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
        writer.setIndentationLevel(this.getIndentationLevel());
        return writer;
    }

    /**
     * Gets a writer with the queued indentation text.
     * @internal
     */
    getWriterWithQueuedIndentation() {
        const writer = this.getWriter();
        writer.queueIndentationLevel(this.getIndentationLevel());
        return writer;
    }

    /**
     * Gets a writer with the child indentation text.
     * @internal
     */
    getWriterWithChildIndentation() {
        const writer = this.getWriter();
        writer.setIndentationLevel(this.getChildIndentationLevel());
        return writer;
    }

    /**
     * Gets a writer with the queued child indentation text.
     * @internal
     */
    getWriterWithQueuedChildIndentation() {
        const writer = this.getWriter();
        writer.queueIndentationLevel(this.getChildIndentationLevel());
        return writer;
    }

    /**
     * Gets a writer with no child indentation text.
     * @internal
     */
    getWriter() {
        return this.context.createWriter();
    }

    /**
     * Gets or creates a node from the internal cache.
     * @internal
     */
    getNodeFromCompilerNode<LocalCompilerNodeType extends ts.Node = ts.Node>(
        compilerNode: LocalCompilerNodeType): CompilerNodeToWrappedType<LocalCompilerNodeType>
    {
        return this.context.compilerFactory.getNodeFromCompilerNode(compilerNode, this.sourceFile);
    }

    /**
     * Gets or creates a node from the internal cache, if it exists.
     * @internal
     */
    getNodeFromCompilerNodeIfExists<LocalCompilerNodeType extends ts.Node = ts.Node>(
        compilerNode: LocalCompilerNodeType | undefined): CompilerNodeToWrappedType<LocalCompilerNodeType> | undefined
    {
        return compilerNode == null ? undefined : this.getNodeFromCompilerNode<LocalCompilerNodeType>(compilerNode);
    }

    /**
     * Ensures that the binder has bound the node before.
     * @internal
     */
    protected ensureBound() {
        if ((this.compilerNode as any).symbol != null)
            return;
        this.getSymbol(); // binds the node
    }
}

function getWrappedCondition(thisNode: Node, condition: ((c: Node) => boolean) | undefined): ((c: ts.Node) => boolean) | undefined {
    return condition == null ? undefined : ((c: ts.Node) => condition(thisNode.getNodeFromCompilerNode(c)));
}

function insertWhiteSpaceTextAtPos(node: Node, insertPos: number, textOrWriterFunction: string | WriterFunction, methodName: string) {
    const parent = TypeGuards.isSourceFile(node) ? node.getChildSyntaxListOrThrow() : node.getParentSyntaxList() || node.getParentOrThrow();
    const newText = getTextFromStringOrWriter(node.getWriterWithQueuedIndentation(), textOrWriterFunction);

    if (!/^[\s\r\n]*$/.test(newText))
        throw new errors.InvalidOperationError(`Cannot insert non-whitespace into ${methodName}.`);

    insertIntoParentTextRange({
        parent,
        insertPos,
        newText
    });
}
