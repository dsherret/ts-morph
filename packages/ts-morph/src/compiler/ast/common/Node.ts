import { ArrayUtils, errors, getSyntaxKindName, nameof, StoredComparer, StringUtils, SymbolFlags, SyntaxKind, ts } from "@ts-morph/common";
import { CodeBlockWriter } from "../../../codeBlockWriter";
import * as compiler from "../../../compiler";
import {
  getNextMatchingPos,
  getNextNonWhitespacePos,
  getPreviousMatchingPos,
  getPreviousNonWhitespacePos,
  getTextFromTextChanges,
  hasNewLineInRange,
  insertIntoParentTextRange,
  replaceSourceFileTextForFormatting,
  replaceSourceFileTextStraight,
} from "../../../manipulation";
import { Project } from "../../../Project";
import { ProjectContext } from "../../../ProjectContext";
import { Structure, Structures } from "../../../structures";
import { WriterFunction } from "../../../types";
import { CharCodes, getParentSyntaxList, getTextFromStringOrWriter, isStringKind, printNode, PrintNodeOptions } from "../../../utils";
import { Symbol } from "../../symbols";
import { FormatCodeSettings } from "../../tools";
import { Type } from "../../types";
import { CommentRange } from "../comment/CommentRange";
import { CompilerNodeToWrappedType } from "../CompilerNodeToWrappedType";
import { Expression } from "../expression";
import { KindToNodeMappings } from "../kindToNodeMappings.generated";
import { SourceFile } from "../module";
import { Statement, StatementedNode } from "../statement";
import { ExtendedParser, hasParsedTokens } from "../utils";
import { SyntaxList } from "./SyntaxList";
import { TextRange } from "./TextRange";
import { ForEachDescendantTraversalControl, TransformTraversalControl } from "./TraversalControl";

export type NodePropertyToWrappedType<NodeType extends ts.Node, KeyName extends keyof NodeType, NonNullableNodeType = NonNullable<NodeType[KeyName]>> =
  NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeTypeForNullable> | undefined ? CompilerNodeToWrappedType<ArrayNodeTypeForNullable>[] | undefined
    : NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeType> ? CompilerNodeToWrappedType<ArrayNodeType>[]
    : NodeType[KeyName] extends ts.Node ? CompilerNodeToWrappedType<NodeType[KeyName]>
    : NonNullableNodeType extends ts.Node ? CompilerNodeToWrappedType<NonNullableNodeType> | undefined
    : NodeType[KeyName];

export type NodeParentType<NodeType extends ts.Node> = NodeType extends ts.SourceFile ? undefined
  : ts.Node extends NodeType ? CompilerNodeToWrappedType<NodeType["parent"]> | undefined
  : CompilerNodeToWrappedType<NodeType["parent"]>;

export class Node<NodeType extends ts.Node = ts.Node> {
  #compilerNode: NodeType | undefined;
  #forgottenText: string | undefined;
  #childStringRanges: [number, number][] | undefined;
  #leadingCommentRanges: CommentRange[] | undefined;
  #trailingCommentRanges: CommentRange[] | undefined;
  /** @internal */
  _wrappedChildCount = 0;

  /** @internal */
  readonly _context: ProjectContext;
  /** @internal */
  protected __sourceFile: SourceFile | undefined;

  /** @internal */
  get _sourceFile(): SourceFile {
    if (this.__sourceFile == null)
      throw new errors.InvalidOperationError("Operation cannot be performed on a node that has no source file.");
    return this.__sourceFile;
  }

  /**
   * Gets the underlying compiler node.
   */
  get compilerNode(): NodeType {
    if (this.#compilerNode == null) {
      let message = "Attempted to get information from a node that was removed or forgotten.";
      if (this.#forgottenText != null)
        message += `\n\nNode text: ${this.#forgottenText}`;
      throw new errors.InvalidOperationError(message);
    }
    return this.#compilerNode;
  }

  /**
   * Initializes a new instance.
   * @private
   * @param context - Project context.
   * @param node - Underlying node.
   * @param sourceFile - Source file for the node.
   */
  constructor(
    context: ProjectContext,
    node: NodeType,
    sourceFile: SourceFile | undefined,
  ) {
    if (context == null || context.compilerFactory == null) {
      throw new errors.InvalidOperationError(
        "Constructing a node is not supported. Please create a source file from the default export "
          + "of the package and manipulate the source file from there.",
      );
    }

    this._context = context;
    this.#compilerNode = node;
    this.__sourceFile = sourceFile;
  }

  /**
   * Releases the node and all its descendants from the underlying node cache and ast.
   *
   * This is useful if you want to improve the performance of manipulation by not tracking this node anymore.
   */
  forget() {
    if (this.wasForgotten())
      return;

    this.forgetDescendants();
    this._forgetOnlyThis();
  }

  /**
   * Forgets the descendants of this node.
   */
  forgetDescendants() {
    for (const child of this._getChildrenInCacheIterator())
      child.forget();
  }

  /**
   * Only forgets this node.
   * @internal
   */
  _forgetOnlyThis() {
    if (this.wasForgotten())
      return;

    const parent = this.getParent();
    if (parent != null)
      parent._wrappedChildCount--;

    const parentSyntaxList = this._getParentSyntaxListIfWrapped();
    if (parentSyntaxList != null)
      parentSyntaxList._wrappedChildCount--;

    this.#storeTextForForgetting();
    this._context.compilerFactory.removeNodeFromCache(this);
    this._clearInternals();
  }

  /**
   * Gets if the compiler node was forgotten.
   *
   * This will be true when the compiler node was forgotten or removed.
   */
  wasForgotten() {
    return this.#compilerNode == null;
  }

  /**
   * Gets if this node has any wrapped children.
   * @internal
   */
  _hasWrappedChildren() {
    return this._wrappedChildCount > 0;
  }

  /**
   * @internal
   *
   * WARNING: This should only be called by the compiler factory!
   */
  _replaceCompilerNodeFromFactory(compilerNode: NodeType) {
    if (compilerNode == null)
      this.#storeTextForForgetting();
    this._clearInternals();
    this.#compilerNode = compilerNode;
  }

  /** @internal */
  #storeTextForForgetting() {
    // check for undefined here just in case
    const sourceFileCompilerNode = this._sourceFile && this._sourceFile.compilerNode;
    const compilerNode = this.#compilerNode;

    if (sourceFileCompilerNode == null || compilerNode == null)
      return;

    this.#forgottenText = getText();

    function getText() {
      const start = compilerNode!.getStart(sourceFileCompilerNode);
      const length = compilerNode!.end - start;
      const trimmedLength = Math.min(length, 100);
      const text = sourceFileCompilerNode.text.substr(start, trimmedLength);
      return trimmedLength !== length ? text + "..." : text;
    }
  }

  /** @internal */
  protected _clearInternals() {
    this.#compilerNode = undefined;
    this.#childStringRanges = undefined;
    clearTextRanges(this.#leadingCommentRanges);
    clearTextRanges(this.#trailingCommentRanges);
    this.#leadingCommentRanges = undefined;
    this.#trailingCommentRanges = undefined;

    function clearTextRanges(textRanges: ReadonlyArray<TextRange> | undefined) {
      if (textRanges == null)
        return;
      textRanges.forEach(r => r._forget());
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

  /** Gets the node's flags. */
  getFlags() {
    return this.compilerNode.flags;
  }

  /**
   * Prints the node using the compiler's printer.
   * @param options - Options.
   */
  print(options: PrintNodeOptions = {}): string {
    if (options.newLineKind == null)
      options.newLineKind = this._context.manipulationSettings.getNewLineKind();

    if (this.getKind() === SyntaxKind.SourceFile)
      return printNode(this.compilerNode, options);
    else
      return printNode(this.compilerNode, this._sourceFile.compilerNode, options);
  }

  /**
   * Gets the symbol or throws an error if it doesn't exist.
   */
  getSymbolOrThrow(message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getSymbol(), message ?? "Could not find the node's symbol.", this);
  }

  /**
   * Gets the compiler symbol or undefined if it doesn't exist.
   */
  getSymbol(): Symbol | undefined {
    const boundSymbol = (this.compilerNode as any).symbol as ts.Symbol | undefined;
    if (boundSymbol != null)
      return this._context.compilerFactory.getSymbol(boundSymbol);

    const typeChecker = this._context.typeChecker;
    const typeCheckerSymbol = typeChecker.getSymbolAtLocation(this);
    if (typeCheckerSymbol != null)
      return typeCheckerSymbol;

    const nameNode = (this.compilerNode as any).name as ts.Node | undefined;
    if (nameNode != null)
      return this._getNodeFromCompilerNode(nameNode).getSymbol();

    return undefined;
  }

  /**
   * Gets the symbols in the scope of the node.
   *
   * Note: This will always return the local symbols. If you want the export symbol from a local symbol, then
   * use the `#getExportSymbol()` method on the symbol.
   * @param meaning - Meaning of symbol to filter by.
   */
  getSymbolsInScope(meaning: SymbolFlags): Symbol[] {
    return this._context.typeChecker.getSymbolsInScope(this, meaning);
  }

  /**
   * Gets the specified local symbol by name or throws if it doesn't exist.
   *
   * WARNING: The symbol table of locals is not exposed publicly by the compiler. Use this at your own risk knowing it may break.
   * @param name - Name of the local symbol.
   */
  getLocalOrThrow(name: string, message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getLocal(name), message ?? (() => `Expected to find local symbol with name: ${name}`), this);
  }

  /**
   * Gets the specified local symbol by name or returns undefined if it doesn't exist.
   *
   * WARNING: The symbol table of locals is not exposed publicly by the compiler. Use this at your own risk knowing it may break.
   * @param name - Name of the local symbol.
   */
  getLocal(name: string): Symbol | undefined {
    const locals = this.#getCompilerLocals();
    if (locals == null)
      return undefined;

    const tsSymbol = locals.get(ts.escapeLeadingUnderscores(name));
    return tsSymbol == null ? undefined : this._context.compilerFactory.getSymbol(tsSymbol);
  }

  /**
   * Gets the symbols within the current scope.
   *
   * WARNING: The symbol table of locals is not exposed publicly by the compiler. Use this at your own risk knowing it may break.
   */
  getLocals(): Symbol[] {
    const locals = this.#getCompilerLocals();
    if (locals == null)
      return [];
    return Array.from(locals.values()).map(symbol => this._context.compilerFactory.getSymbol(symbol));
  }

  /** @internal */
  #getCompilerLocals() {
    this._ensureBound();
    return (this.compilerNode as any).locals as ts.SymbolTable | undefined;
  }

  /**
   * Gets the type of the node.
   */
  getType(): Type {
    return this._context.typeChecker.getTypeAtLocation(this);
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
    errors.throwIfOutOfRange(pos, [this.getPos(), this.getEnd()], "pos");

    if (this.#childStringRanges == null) {
      this.#childStringRanges = [];
      for (const descendant of this._getCompilerDescendantsIterator()) {
        if (isStringKind(descendant.kind))
          this.#childStringRanges.push([descendant.getStart(this._sourceFile.compilerNode), descendant.getEnd()]);
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

    return ArrayUtils.binarySearch(this.#childStringRanges, new InStringRangeComparer()) !== -1;
  }

  /**
   * Gets the node as the specified kind if it is equal to that kind, otherwise throws.
   * @param kind - Syntax kind.
   */
  asKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind] {
    return errors.throwIfNullOrUndefined(
      this.asKind(kind),
      message ?? (() => `Expected the node to be of kind ${getSyntaxKindName(kind)}, but it was ${getSyntaxKindName(this.getKind())}.`),
      this,
    );
  }

  /**
   * Returns if the node is the specified kind.
   *
   * This is a type guard.
   * @param kind - Syntax kind.
   */
  isKind<TKind extends SyntaxKind>(kind: TKind): this is KindToNodeMappings[TKind] {
    return this.getKind() === kind;
  }

  /**
   * Gets the node as the specified kind if it is equal to that kind, otherwise returns undefined.
   * @param kind - Syntax kind.
   */
  asKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    if (this.isKind(kind))
      return this;
    else
      return undefined;
  }

  /**
   * Gets the first child by a condition or throws.
   * @param condition - Condition.
   */
  getFirstChildOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  /**
   * Gets the first child by a condition or throws.
   * @param condition - Condition.
   */
  getFirstChildOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getFirstChildOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getFirstChild(condition), message ?? "Could not find a child that matched the specified condition.", this);
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
    const firstChild = this._getCompilerFirstChild(getWrappedCondition(this, condition));
    return this._getNodeFromCompilerNodeIfExists(firstChild);
  }

  /**
   * Gets the last child by a condition or throws.
   * @param condition - Condition.
   */
  getLastChildOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  /**
   * Gets the last child by a condition or throws.
   * @param condition - Condition.
   */
  getLastChildOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getLastChildOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getLastChild(condition), message ?? "Could not find a child that matched the specified condition.", this);
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
    const lastChild = this._getCompilerLastChild(getWrappedCondition(this, condition));
    return this._getNodeFromCompilerNodeIfExists(lastChild);
  }

  /**
   * Gets the first descendant by a condition or throws.
   * @param condition - Condition.
   */
  getFirstDescendantOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  /**
   * Gets the first descendant by a condition or throws.
   * @param condition - Condition.
   */
  getFirstDescendantOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getFirstDescendantOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getFirstDescendant(condition),
      message ?? "Could not find a descendant that matched the specified condition.",
      this,
    );
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
    for (const descendant of this._getDescendantsIterator()) {
      if (condition == null || condition(descendant))
        return descendant;
    }
    return undefined;
  }

  /**
   * Gets the previous sibling or throws.
   * @param condition - Optional condition for getting the previous sibling.
   */
  getPreviousSiblingOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  /**
   * Gets the previous sibling or throws.
   * @param condition - Optional condition for getting the previous sibling.
   */
  getPreviousSiblingOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getPreviousSiblingOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getPreviousSibling(condition), message ?? "Could not find the previous sibling.", this);
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
    const previousSibling = this._getCompilerPreviousSibling(getWrappedCondition(this, condition));
    return this._getNodeFromCompilerNodeIfExists(previousSibling);
  }

  /**
   * Gets the next sibling or throws.
   * @param condition - Optional condition for getting the next sibling.
   */
  getNextSiblingOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  /**
   * Gets the next sibling or throws.
   * @param condition - Optional condition for getting the next sibling.
   */
  getNextSiblingOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getNextSiblingOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getNextSibling(condition), message ?? "Could not find the next sibling.", this);
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
    const nextSibling = this._getCompilerNextSibling(getWrappedCondition(this, condition));
    return this._getNodeFromCompilerNodeIfExists(nextSibling);
  }

  /**
   * Gets the previous siblings.
   *
   * Note: Closest sibling is the zero index.
   */
  getPreviousSiblings(): Node[] {
    return this._getCompilerPreviousSiblings().map(n => this._getNodeFromCompilerNode(n));
  }

  /**
   * Gets the next siblings.
   *
   * Note: Closest sibling is the zero index.
   */
  getNextSiblings(): Node[] {
    return this._getCompilerNextSiblings().map(n => this._getNodeFromCompilerNode(n));
  }

  /**
   * Gets all the children of the node.
   */
  getChildren(): Node[] {
    return this._getCompilerChildren().map(n => this._getNodeFromCompilerNode(n));
  }

  /**
   * Gets the child at the specified index.
   * @param index - Index of the child.
   */
  getChildAtIndex(index: number): Node {
    return this._getNodeFromCompilerNode(this._getCompilerChildAtIndex(index));
  }

  /**
   * @internal
   */
  *_getChildrenIterator(): IterableIterator<Node> {
    for (const compilerChild of this._getCompilerChildren())
      yield this._getNodeFromCompilerNode(compilerChild);
  }

  /**
   * @internal
   */
  *_getChildrenInCacheIterator(): IterableIterator<Node> {
    const children = this._getCompilerChildrenFast();
    for (const child of children) {
      if (this._context.compilerFactory.hasCompilerNode(child))
        yield this._context.compilerFactory.getExistingNodeFromCompilerNode(child)!;
      else if (child.kind === SyntaxKind.SyntaxList) {
        // always return syntax lists because their children could be in the cache
        yield this._getNodeFromCompilerNode(child);
      }
    }
  }

  /**
   * Gets the child syntax list or throws if it doesn't exist.
   */
  getChildSyntaxListOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getChildSyntaxList(), message ?? "A child syntax list was expected.", this);
  }

  /**
   * Gets the child syntax list if it exists.
   */
  getChildSyntaxList(): SyntaxList | undefined {
    let node: Node = this;
    if (Node.isBodyable(node) || Node.isBodied(node)) {
      do {
        const bodyNode = Node.isBodyable(node) ? node.getBody() : node.getBody();
        if (bodyNode == null)
          return undefined;
        node = bodyNode;
      } while ((Node.isBodyable(node) || Node.isBodied(node)) && (node.compilerNode as ts.Block).statements == null);
    }

    if (
      Node.isSourceFile(node)
      || Node.isBodyable(this)
      || Node.isBodied(this)
      || Node.isCaseBlock(this)
      || Node.isCaseClause(this)
      || Node.isDefaultClause(this)
      || Node.isJsxElement(this)
    ) {
      return node.getFirstChildByKind(SyntaxKind.SyntaxList);
    }

    let passedBrace = false;
    for (const child of node._getCompilerChildren()) {
      if (!passedBrace)
        passedBrace = child.kind === SyntaxKind.OpenBraceToken;
      else if (child.kind === SyntaxKind.SyntaxList)
        return this._getNodeFromCompilerNode(child) as SyntaxList;
    }

    return undefined;
  }

  /**
   * Invokes the `cbNode` callback for each child and the `cbNodeArray` for every array of nodes stored in properties of the node.
   * If `cbNodeArray` is not defined, then it will pass every element of the array to `cbNode`.
   * @returns The first truthy value returned by a callback.
   * @param cbNode - Callback invoked for each child.
   * @param cbNodeArray - Callback invoked for each array of nodes.
   */
  forEachChild<T>(cbNode: (node: Node) => T | undefined, cbNodeArray?: (nodes: Node[]) => T | undefined): T | undefined {
    const snapshots: (Node | Node[])[] = [];

    // Get all the nodes from the compiler's forEachChild. Taking this snapshot prevents the results of
    // .forEachChild from returning out of date nodes due to a manipulation or deletion
    this.compilerNode.forEachChild(
      node => {
        // use function block to ensure a truthy value is not returned
        snapshots.push(this._getNodeFromCompilerNode(node));
      },
      cbNodeArray == null ? undefined : nodes => {
        snapshots.push(nodes.map(n => this._getNodeFromCompilerNode(n)));
      },
    );

    // now send them to the user
    for (const snapshot of snapshots) {
      if (snapshot instanceof Array) {
        const filteredNodes = snapshot.filter(n => !n.wasForgotten());
        if (filteredNodes.length > 0) {
          const returnValue = cbNodeArray!(filteredNodes);
          if (returnValue)
            return returnValue;
        }
      } else if (!snapshot.wasForgotten()) {
        const returnValue = cbNode(snapshot);
        if (returnValue)
          return returnValue;
      }
    }

    return undefined;
  }

  /**
   * Invokes the `cbNode` callback for each descendant and the `cbNodeArray` for every array of nodes stored in properties of the node and descendant nodes.
   * If `cbNodeArray` is not defined, then it will pass every element of the array to `cbNode`.
   *
   * @returns The first truthy value returned by a callback.
   * @remarks There exists a `traversal` object on the second parameter that allows various control of iteration.
   * @param cbNode - Callback invoked for each descendant.
   * @param cbNodeArray - Callback invoked for each array of nodes.
   */
  forEachDescendant<T>(
    cbNode: (node: Node, traversal: ForEachDescendantTraversalControl) => T | undefined,
    cbNodeArray?: (nodes: Node[], traversal: ForEachDescendantTraversalControl) => T | undefined,
  ): T | undefined {
    const stopReturnValue: any = {};
    const upReturnValue: any = {};
    let stop = false;
    let up = false;
    const traversal = {
      stop: () => stop = true,
      up: () => up = true,
    };
    const nodeCallback: (node: Node) => T | undefined = (node: Node) => {
      if (stop)
        return stopReturnValue;

      let skip = false;

      const returnValue = cbNode(node, {
        ...traversal,
        skip: () => skip = true,
      });

      if (returnValue)
        return returnValue;

      if (stop)
        return stopReturnValue;

      if (skip || up)
        return undefined;

      if (!node.wasForgotten())
        return forEachChildForNode(node);
      return undefined;
    };
    const arrayCallback: ((nodes: Node[]) => T | undefined) | undefined = cbNodeArray == null ? undefined : (nodes: Node[]) => {
      if (stop)
        return stopReturnValue;

      let skip = false;

      const returnValue = cbNodeArray(nodes, {
        ...traversal,
        skip: () => skip = true,
      });

      if (returnValue)
        return returnValue;

      if (skip)
        return undefined;

      for (const node of nodes) {
        if (stop)
          return stopReturnValue;
        if (up)
          return undefined;

        const innerReturnValue = forEachChildForNode(node);
        if (innerReturnValue)
          return innerReturnValue;
      }

      return undefined;
    };

    const finalResult = forEachChildForNode(this);
    return finalResult === stopReturnValue ? undefined : finalResult;

    function forEachChildForNode(node: Node): T | undefined {
      const result = node.forEachChild<T>(
        innerNode => {
          const returnValue = nodeCallback(innerNode);
          if (up) {
            up = false;
            return returnValue || upReturnValue;
          }
          return returnValue;
        },
        arrayCallback == null ? undefined : nodes => {
          const returnValue = arrayCallback(nodes);
          if (up) {
            up = false;
            return returnValue || upReturnValue;
          }
          return returnValue;
        },
      );
      return result === upReturnValue ? undefined : result;
    }
  }

  /**
   * Gets the child nodes passed to the delegate of `node.forEachChild(child => {})` as an array.
   */
  forEachChildAsArray() {
    const children: Node[] = [];
    this.compilerNode.forEachChild(child => {
      children.push(this._getNodeFromCompilerNode(child));
    });
    return children;
  }

  /**
   * Gets the descendant nodes passed to the delegate of `node.forEachDescendant(descendant => {})` as an array.
   */
  forEachDescendantAsArray() {
    const descendants: Node[] = [];
    this.forEachDescendant(descendant => {
      descendants.push(descendant);
    });
    return descendants;
  }

  /**
   * Gets the node's descendants.
   */
  getDescendants(): Node[] {
    return Array.from(this._getDescendantsIterator());
  }

  /**
   * Gets the node's descendants as an iterator.
   * @internal
   */
  *_getDescendantsIterator(): IterableIterator<Node> {
    for (const descendant of this._getCompilerDescendantsIterator())
      yield this._getNodeFromCompilerNode(descendant);
  }

  /**
   * Gets the node's descendant statements and any arrow function statement-like expressions (ex. returns the expression `5` in `() => 5`).
   */
  getDescendantStatements(): (Statement | Expression)[] {
    type NodeWithStatements = ts.Node & { statements: ts.NodeArray<ts.Statement> };
    const statements: (Statement | Expression)[] = [];

    handleNode(this, this.compilerNode);

    return statements;

    function handleNode(thisNode: Node, node: ts.Node) {
      if (handleStatements(thisNode, node))
        return;
      else if (node.kind === SyntaxKind.ArrowFunction) {
        const arrowFunction = node as ts.ArrowFunction;
        if (arrowFunction.body.kind !== SyntaxKind.Block)
          statements.push(thisNode._getNodeFromCompilerNode(arrowFunction.body));
        else
          handleNode(thisNode, arrowFunction.body);
      } else {
        handleChildren(thisNode, node);
      }
    }

    function handleStatements(thisNode: Node, node: ts.Node) {
      if ((node as NodeWithStatements).statements == null)
        return false;
      const statementedNode = thisNode._getNodeFromCompilerNode(node) as Node & StatementedNode;
      for (const statement of statementedNode.getStatements()) {
        statements.push(statement);
        handleChildren(thisNode, statement.compilerNode);
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
    // Do not use the compiler's #getChildCount() because it
    // does not take into account comment nodes.
    return this._getCompilerChildren().length;
  }

  /**
   * Gets the child at the provided text position, or undefined if not found.
   * @param pos - Text position to search for.
   */
  getChildAtPos(pos: number): Node | undefined {
    if (pos < this.getPos() || pos >= this.getEnd())
      return undefined;

    for (const child of this._getCompilerChildren()) {
      if (pos >= child.pos && pos < child.end)
        return this._getNodeFromCompilerNode(child);
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

    this._context.compilerFactory.forgetNodesCreatedInBlock(remember => {
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
   * @param includeJsDocComments - Whether to include the JS doc comments.
   */
  getStart(includeJsDocComments?: boolean) {
    // rare time a bool parameter will be used... it's because it's done in the ts compiler
    return this.compilerNode.getStart(this._sourceFile.compilerNode, includeJsDocComments);
  }

  /**
   * Gets the source file text position of the end of the last significant token or the start of the source file.
   */
  getFullStart() {
    return this.compilerNode.getFullStart();
  }

  /**
   * Gets the first source file text position that is not whitespace taking into account comment nodes and a previous node's trailing trivia.
   */
  getNonWhitespaceStart(): number {
    return this._context.compilerFactory.forgetNodesCreatedInBlock(() => {
      const parent = this.getParent() as Node | undefined;
      const pos = this.getPos();
      const parentTakesPrecedence = parent != null
        && !Node.isSourceFile(parent)
        && parent.getPos() === pos;

      if (parentTakesPrecedence)
        return this.getStart(true);

      let startSearchPos: number;
      const sourceFileFullText = this._sourceFile.getFullText();
      const previousSibling = this.getPreviousSibling();

      if (previousSibling != null && Node.isCommentNode(previousSibling))
        startSearchPos = previousSibling.getEnd();
      else if (previousSibling != null) {
        if (hasNewLineInRange(sourceFileFullText, [pos, this.getStart(true)]))
          startSearchPos = previousSibling.getTrailingTriviaEnd();
        else
          startSearchPos = pos;
      } else {
        startSearchPos = this.getPos();
      }

      return getNextNonWhitespacePos(sourceFileFullText, startSearchPos);
    });
  }

  /**
   * Gets the source file text position going forward the result of .getTrailingTriviaEnd() that is not whitespace.
   * @internal
   */
  _getTrailingTriviaNonWhitespaceEnd() {
    return getPreviousNonWhitespacePos(this._sourceFile.getFullText(), this.getTrailingTriviaEnd());
  }

  /**
   * Gets the text length of the node without trivia.
   * @param includeJsDocComments - Whether to include the JS doc comments in the width or not.
   */
  getWidth(includeJsDocComments?: boolean) {
    // Compiler code is this.getEnd() - this.getStart(sourceFile), but this
    // takes into account js doc comments as well.
    return this.getEnd() - this.getStart(includeJsDocComments);
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
    return this.compilerNode.getLeadingTriviaWidth(this._sourceFile.compilerNode);
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

    return getNextMatchingPos(this._sourceFile.getFullText(), searchStart, char => char !== CharCodes.SPACE && char !== CharCodes.TAB);

    function getSearchStart() {
      return trailingComments.length > 0 ? trailingComments[trailingComments.length - 1].getEnd() : end;
    }
  }

  /**
   * Gets the text without leading trivia (comments and whitespace).
   * @param includeJsDocComments - Whether to include the js doc comments when getting the text.
   */
  getText(includeJsDocComments?: boolean): string;
  /**
   * Gets the text without leading trivia (comments and whitespace).
   * @param options - Options for getting the text.
   */
  getText(options: { trimLeadingIndentation?: boolean; includeJsDocComments?: boolean }): string;
  getText(includeJsDocCommentOrOptions?: boolean | { trimLeadingIndentation?: boolean; includeJsDocComments?: boolean }): string {
    const options = typeof includeJsDocCommentOrOptions === "object" ? includeJsDocCommentOrOptions : undefined;
    const includeJsDocComments = includeJsDocCommentOrOptions === true || (options != null && options.includeJsDocComments);
    const trimLeadingIndentation = options != null && options.trimLeadingIndentation;

    const startPos = this.getStart(includeJsDocComments);
    const text = this._sourceFile.getFullText().substring(startPos, this.getEnd());

    if (trimLeadingIndentation) {
      return StringUtils.removeIndentation(text, {
        isInStringAtPos: pos => this._sourceFile.isInStringAtPos(pos + startPos),
        indentSizeInSpaces: this._context.manipulationSettings._getIndentSizeInSpaces(),
      });
    } else {
      return text;
    }
  }

  /**
   * Gets the full text with leading trivia (comments and whitespace).
   */
  getFullText(): string {
    return this.compilerNode.getFullText(this._sourceFile.compilerNode);
  }

  /**
   * Gets the combined modifier flags.
   */
  getCombinedModifierFlags() {
    // todo: make this method only available on declarations in the future.
    return ts.getCombinedModifierFlags(this.compilerNode as any as ts.Declaration);
  }

  /** Gets the source file. */
  getSourceFile(): SourceFile {
    return this._sourceFile;
  }

  /** Gets the project. */
  getProject(): Project {
    return this._context.project;
  }

  /**
   * Gets a compiler node property wrapped in a Node.
   * @param propertyName - Property name.
   */
  getNodeProperty<
    KeyType extends keyof LocalNodeType,
    LocalNodeType extends ts.Node = NodeType, // necessary to make the compiler less strict when assigning "this" to Node<NodeType>
  >(propertyName: KeyType): NodePropertyToWrappedType<LocalNodeType, KeyType> {
    const property = (this.compilerNode as any)[propertyName] as any | any[];

    if (property == null)
      return undefined as any;
    else if (property instanceof Array)
      return property.map(p => isNode(p) ? this._getNodeFromCompilerNode(p) : p) as any;
    else if (isNode(property))
      return this._getNodeFromCompilerNode(property) as any;
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
    return Array.from(this._getAncestorsIterator(includeSyntaxLists));
  }

  /**
   * @internal
   */
  *_getAncestorsIterator(includeSyntaxLists: boolean): IterableIterator<Node> {
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
  getParent() {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.parent);
  }

  /**
   * Gets the parent or throws an error if it doesn't exist.
   */
  getParentOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getParent(), message ?? "Expected to find a parent.", this);
  }

  /**
   * Goes up the parents (ancestors) of the node while a condition is true.
   * Throws if the initial parent doesn't match the condition.
   * @param condition - Condition that tests the parent to see if the expression is true.
   */
  getParentWhileOrThrow<T extends Node>(condition: (parent: Node, node: Node) => parent is T, message?: string | (() => string)): T;
  /**
   * Goes up the parents (ancestors) of the node while a condition is true.
   * Throws if the initial parent doesn't match the condition.
   * @param condition - Condition that tests the parent to see if the expression is true.
   */
  getParentWhileOrThrow(condition: (parent: Node, node: Node) => boolean, message?: string | (() => string)): Node;
  getParentWhileOrThrow(condition: (parent: Node, node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getParentWhile(condition), message ?? "The initial parent did not match the provided condition.", this);
  }

  /**
   * Goes up the parents (ancestors) of the node while a condition is true.
   * Returns undefined if the initial parent doesn't match the condition.
   * @param condition - Condition that tests the parent to see if the expression is true.
   */
  getParentWhile<T extends Node>(condition: (parent: Node, child: Node) => parent is T): T | undefined;
  /**
   * Goes up the parents (ancestors) of the node while a condition is true.
   * Returns undefined if the initial parent doesn't match the condition.
   * @param condition - Condition that tests the parent to see if the expression is true.
   */
  getParentWhile(condition: (parent: Node, child: Node) => boolean): Node | undefined;
  getParentWhile(condition: (parent: Node, child: Node) => boolean) {
    let node: Node | undefined = undefined;
    let parent: Node | undefined = this.getParent();

    while (parent && condition(parent, node || this)) {
      node = parent;
      parent = node.getParent();
    }

    return node;
  }

  /**
   * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
   * Throws if the initial parent is not the specified syntax kind.
   * @param kind - Syntax kind to check for.
   */
  getParentWhileKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getParentWhileKind(kind),
      message ?? (() => `The initial parent was not a syntax kind of ${getSyntaxKindName(kind)}.`),
      this,
    );
  }

  /**
   * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
   * Returns undefined if the initial parent is not the specified syntax kind.
   * @param kind - Syntax kind to check for.
   */
  getParentWhileKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    return this.getParentWhile(n => n.getKind() === kind) as KindToNodeMappings[TKind] | undefined;
  }

  /**
   * Gets the last token of this node. Usually this is a close brace.
   */
  getLastToken(): Node {
    const lastToken = this.compilerNode.getLastToken(this._sourceFile.compilerNode);
    if (lastToken == null)
      throw new errors.NotImplementedError("Not implemented scenario where the last token does not exist.");

    return this._getNodeFromCompilerNode(lastToken);
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
  getParentSyntaxListOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getParentSyntaxList(), message ?? "Expected the parent to be a syntax list.", this);
  }

  /**
   * Gets the parent if it's a syntax list.
   */
  getParentSyntaxList(): SyntaxList | undefined {
    // comment nodes need special handling because they might not be within the range of the syntax list
    const kind = this.getKind();
    if (kind === SyntaxKind.SingleLineCommentTrivia || kind === SyntaxKind.MultiLineCommentTrivia)
      return this.getParentOrThrow().getChildSyntaxList();

    const syntaxList = getParentSyntaxList(this.compilerNode, this._sourceFile.compilerNode);
    return this._getNodeFromCompilerNodeIfExists(syntaxList);
  }

  /**
   * Gets the parent syntax list if it's been wrapped.
   * @internal
   */
  _getParentSyntaxListIfWrapped(): SyntaxList | undefined {
    const parent = this.getParent();
    if (parent == null || !hasParsedTokens(parent.compilerNode))
      return undefined;
    return this.getParentSyntaxList();
  }

  /**
   * Gets the child index of this node relative to the parent.
   */
  getChildIndex(): number {
    const parent = this.getParentSyntaxList() || this.getParentOrThrow();
    const index = parent._getCompilerChildren().indexOf(this.compilerNode);

    if (index === -1)
      throw new errors.NotImplementedError("For some reason the child's parent did not contain the child.");

    return index;
  }

  /**
   * Gets the indentation level of the current node.
   */
  getIndentationLevel() {
    const indentationText = this._context.manipulationSettings.getIndentationText();
    return this._context.languageService.getIdentationAtPosition(this._sourceFile, this.getStart()) / indentationText.length;
  }

  /**
   * Gets the child indentation level of the current node.
   */
  getChildIndentationLevel(): number {
    if (Node.isSourceFile(this))
      return 0;

    return this.getIndentationLevel() + 1;
  }

  /**
   * Gets the indentation text.
   * @param offset - Optional number of levels of indentation to add or remove.
   */
  getIndentationText(offset = 0): string {
    return this.#getIndentationTextForLevel(this.getIndentationLevel() + offset);
  }

  /**
   * Gets the next indentation level text.
   * @param offset - Optional number of levels of indentation to add or remove.
   */
  getChildIndentationText(offset = 0): string {
    return this.#getIndentationTextForLevel(this.getChildIndentationLevel() + offset);
  }

  /**
   * @internal
   */
  #getIndentationTextForLevel(level: number) {
    return this._context.manipulationSettings.getIndentationText().repeat(level);
  }

  /**
   * Gets the position of the start of the line that this node starts on.
   * @param includeJsDocComments - Whether to include the JS doc comments or not.
   */
  getStartLinePos(includeJsDocComments?: boolean) {
    const sourceFileText = this._sourceFile.getFullText();
    return getPreviousMatchingPos(
      sourceFileText,
      this.getStart(includeJsDocComments),
      char => char === CharCodes.NEWLINE || char === CharCodes.CARRIAGE_RETURN,
    );
  }

  /**
   * Gets the line number at the start of the node.
   * @param includeJsDocComments - Whether to include the JS doc comments or not.
   */
  getStartLineNumber(includeJsDocComments?: boolean) {
    return StringUtils.getLineNumberAtPos(this._sourceFile.getFullText(), this.getStartLinePos(includeJsDocComments));
  }

  /**
   * Gets the line number of the end of the node.
   */
  getEndLineNumber() {
    const sourceFileText = this._sourceFile.getFullText();
    const endLinePos = getPreviousMatchingPos(sourceFileText, this.getEnd(), char => char === CharCodes.NEWLINE || char === CharCodes.CARRIAGE_RETURN);
    return StringUtils.getLineNumberAtPos(this._sourceFile.getFullText(), endLinePos);
  }

  /**
   * Gets if this is the first node on the current line.
   */
  isFirstNodeOnLine() {
    const sourceFileText = this._sourceFile.getFullText();
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
   * @remarks This will replace the text from the `Node#getStart(true)` position (start position with js docs) to `Node#getEnd()`.
   * Use `Node#getText(true)` to get all the text that will be replaced.
   */
  replaceWithText(textOrWriterFunction: string | WriterFunction): Node;
  /** @internal */
  replaceWithText(textOrWriterFunction: string | WriterFunction, writer: CodeBlockWriter): Node;
  replaceWithText(textOrWriterFunction: string | WriterFunction, writer?: CodeBlockWriter): Node {
    const newText = getTextFromStringOrWriter(writer || this._getWriterWithQueuedIndentation(), textOrWriterFunction);
    if (Node.isSourceFile(this)) {
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
        textLength: this.getEnd() - start,
      },
    });

    return parent.getChildren()[childIndex];
  }

  /**
   * Prepends the specified whitespace to current node.
   * @param textOrWriterFunction - Text or writer function.
   */
  prependWhitespace(textOrWriterFunction: string | WriterFunction) {
    insertWhiteSpaceTextAtPos(this, this.getStart(true), textOrWriterFunction, nameof(this, "prependWhitespace"));
  }

  /**
   * Appends the specified whitespace to current node.
   * @param textOrWriterFunction - Text or writer function.
   */
  appendWhitespace(textOrWriterFunction: string | WriterFunction) {
    insertWhiteSpaceTextAtPos(this, this.getEnd(), textOrWriterFunction, nameof(this, "appendWhitespace"));
  }

  /**
   * Formats the node's text using the internal TypeScript formatting API.
   * @param settings - Format code settings.
   */
  formatText(settings: FormatCodeSettings = {}) {
    const formattingEdits = this._context.languageService.getFormattingEditsForRange(
      this._sourceFile.getFilePath(),
      [this.getStart(true), this.getEnd()],
      settings,
    );

    replaceSourceFileTextForFormatting({
      sourceFile: this._sourceFile,
      newText: getTextFromTextChanges(this._sourceFile, formattingEdits),
    });
  }

  /**
   * Transforms the node using the compiler api nodes and functions and returns
   * the node that was transformed (experimental).
   *
   * WARNING: This will forget descendants of transformed nodes and potentially this node.
   * @example Increments all the numeric literals in a source file.
   * ```ts
   * sourceFile.transform(traversal => {
   *   const node = traversal.visitChildren(); // recommend always visiting the children first (post order)
   *   if (ts.isNumericLiteral(node))
   *     return ts.createNumericLiteral((parseInt(node.text, 10) + 1).toString());
   *   return node;
   * });
   * ```
   * @example Updates the class declaration node without visiting the children.
   * ```ts
   * const classDec = sourceFile.getClassOrThrow("MyClass");
   * classDec.transform(traversal => {
   *   const node = traversal.currentNode;
   *   return ts.updateClassDeclaration(node, undefined, undefined, ts.createIdentifier("MyUpdatedClass"), undefined, undefined, []);
   * });
   * ```
   */
  transform(visitNode: (traversal: TransformTraversalControl) => ts.Node): Node {
    const compilerFactory = this._context.compilerFactory;
    const printer = ts.createPrinter({
      newLine: this._context.manipulationSettings.getNewLineKind(),
      removeComments: false,
    });
    interface Transformation {
      start: number;
      end: number;
      compilerNode: ts.Node;
    }
    const transformations: Transformation[] = [];
    const compilerSourceFile = this._sourceFile.compilerNode;
    const compilerNode = this.compilerNode;
    const transformerFactory: ts.TransformerFactory<ts.Node> = context => {
      return rootNode => innerVisit(rootNode, context);
    };

    if (this.getKind() === ts.SyntaxKind.SourceFile) {
      ts.transform(compilerNode, [transformerFactory], this._context.compilerOptions.get());

      replaceSourceFileTextStraight({
        sourceFile: this._sourceFile,
        newText: getTransformedText([0, this.getEnd()]),
      });

      return this;
    } else {
      const parent = this.getParentSyntaxList() || this.getParentOrThrow();
      const childIndex = this.getChildIndex();
      const start = this.getStart(true);
      const end = this.getEnd();

      ts.transform(compilerNode, [transformerFactory], this._context.compilerOptions.get());

      insertIntoParentTextRange({
        parent,
        insertPos: start,
        newText: getTransformedText([start, end]),
        replacing: {
          textLength: end - start,
        },
      });

      return parent.getChildren()[childIndex];
    }

    function innerVisit(node: ts.Node, context: ts.TransformationContext) {
      const traversal: TransformTraversalControl = {
        factory: context.factory,
        visitChildren() {
          node = ts.visitEachChild(node, child => innerVisit(child, context), context);
          return node;
        },
        currentNode: node,
      };
      const resultNode = visitNode(traversal);
      handleTransformation(node, resultNode);
      return resultNode;
    }

    function handleTransformation(oldNode: ts.Node, newNode: ts.Node) {
      if (oldNode === newNode && (newNode as any).emitNode == null)
        return;

      const start = oldNode.getStart(compilerSourceFile, true);
      const end = oldNode.end;
      let lastTransformation: Transformation | undefined;

      // remove any prior transformations nested within this transformation
      while ((lastTransformation = transformations[transformations.length - 1]) && lastTransformation.start > start)
        transformations.pop();

      const wrappedNode = compilerFactory.getExistingNodeFromCompilerNode(oldNode);
      transformations.push({
        start,
        end,
        compilerNode: newNode,
      });

      // It's very difficult and expensive to tell about changes that could have happened to the descendants
      // via updating properties. For this reason, descendant nodes will always be forgotten.
      if (wrappedNode != null) {
        if (oldNode.kind !== newNode.kind)
          wrappedNode.forget();
        else
          wrappedNode.forgetDescendants();
      }
    }

    function getTransformedText(replaceRange: [number, number]) {
      const fileText = compilerSourceFile.getFullText();
      let finalText = "";
      let lastPos = replaceRange[0];

      for (const transform of transformations) {
        finalText += fileText.substring(lastPos, transform.start);
        finalText += printer.printNode(ts.EmitHint.Unspecified, transform.compilerNode, transform.compilerNode.getSourceFile() ?? compilerSourceFile);
        lastPos = transform.end;
      }

      finalText += fileText.substring(lastPos, replaceRange[1]);
      return finalText;
    }
  }

  /**
   * Gets the leading comment ranges of the current node.
   */
  getLeadingCommentRanges(): CommentRange[] {
    return this.#leadingCommentRanges || (this.#leadingCommentRanges = this.#getCommentsAtPos(this.getFullStart(), (text: string, pos: number) => {
      const comments = ts.getLeadingCommentRanges(text, pos) || [];
      // if this is a comment, then only include leading comment ranges before this one
      if (this.getKind() === SyntaxKind.SingleLineCommentTrivia || this.getKind() === SyntaxKind.MultiLineCommentTrivia) {
        const thisPos = this.getPos();
        return comments.filter(r => r.pos < thisPos);
      } else {
        return comments;
      }
    }));
  }

  /**
   * Gets the trailing comment ranges of the current node.
   */
  getTrailingCommentRanges(): CommentRange[] {
    return this.#trailingCommentRanges ?? (this.#trailingCommentRanges = this.#getCommentsAtPos(this.getEnd(), ts.getTrailingCommentRanges));
  }

  /** @internal */
  #getCommentsAtPos(pos: number, getComments: (text: string, pos: number) => ReadonlyArray<ts.CommentRange> | undefined) {
    if (this.getKind() === SyntaxKind.SourceFile)
      return [];

    return (getComments(this._sourceFile.getFullText(), pos) ?? []).map(r => new CommentRange(r, this._sourceFile));
  }

  /**
   * Gets the children based on a kind.
   * @param kind - Syntax kind.
   */
  getChildrenOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][] {
    return this._getCompilerChildrenOfKind(kind).map(c => this._getNodeFromCompilerNode(c) as KindToNodeMappings[TKind]);
  }

  /**
   * Gets the first child by syntax kind or throws an error if not found.
   * @param kind - Syntax kind.
   */
  getFirstChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind] {
    return errors.throwIfNullOrUndefined(
      this.getFirstChildByKind(kind),
      message ?? (() => `A child of the kind ${getSyntaxKindName(kind)} was expected.`),
      this,
    );
  }

  /**
   * Gets the first child by syntax kind.
   * @param kind - Syntax kind.
   */
  getFirstChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    const child = this._getCompilerChildrenOfKind(kind)[0];
    return child == null ? undefined : (this._getNodeFromCompilerNode(child) as KindToNodeMappings[TKind]);
  }

  /**
   * Gets the first child if it matches the specified syntax kind or throws an error if not found.
   * @param kind - Syntax kind.
   */
  getFirstChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind] {
    return errors.throwIfNullOrUndefined(
      this.getFirstChildIfKind(kind),
      message ?? (() => `A first child of the kind ${getSyntaxKindName(kind)} was expected.`),
      this,
    );
  }

  /**
   * Gets the first child if it matches the specified syntax kind.
   * @param kind - Syntax kind.
   */
  getFirstChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    const firstChild = this._getCompilerFirstChild();
    return firstChild != null && firstChild.kind === kind ? (this._getNodeFromCompilerNode(firstChild) as KindToNodeMappings[TKind]) : undefined;
  }

  /**
   * Gets the last child by syntax kind or throws an error if not found.
   * @param kind - Syntax kind.
   */
  getLastChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getLastChildByKind(kind),
      message ?? (() => `A child of the kind ${getSyntaxKindName(kind)} was expected.`),
      this,
    );
  }

  /**
   * Gets the last child by syntax kind.
   * @param kind - Syntax kind.
   */
  getLastChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    const children = this._getCompilerChildrenOfKind(kind);
    const lastChild = children[children.length - 1] as ts.Node | undefined;
    return this._getNodeFromCompilerNodeIfExists(lastChild) as KindToNodeMappings[TKind] | undefined;
  }

  /**
   * Gets the last child if it matches the specified syntax kind or throws an error if not found.
   * @param kind - Syntax kind.
   */
  getLastChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getLastChildIfKind(kind),
      message ?? (() => `A last child of the kind ${getSyntaxKindName(kind)} was expected.`),
      this,
    );
  }

  /**
   * Gets the last child if it matches the specified syntax kind.
   * @param kind - Syntax kind.
   */
  getLastChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    const lastChild = this._getCompilerLastChild();
    return lastChild != null && lastChild.kind === kind ? (this._getNodeFromCompilerNode(lastChild) as KindToNodeMappings[TKind]) : undefined;
  }

  /**
   * Gets the child at the specified index if it's the specified kind or throws an exception.
   * @param index - Child index to get.
   * @param kind - Expected kind.
   */
  getChildAtIndexIfKindOrThrow<TKind extends SyntaxKind>(index: number, kind: TKind, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getChildAtIndexIfKind(index, kind),
      message ?? (() => `Child at index ${index} was expected to be ${getSyntaxKindName(kind)}`),
      this,
    );
  }

  /**
   * Gets the child at the specified index if it's the specified kind or returns undefined.
   * @param index - Child index to get.
   * @param kind - Expected kind.
   */
  getChildAtIndexIfKind<TKind extends SyntaxKind>(index: number, kind: TKind): KindToNodeMappings[TKind] | undefined {
    const node = this._getCompilerChildAtIndex(index);
    return node.kind === kind ? (this._getNodeFromCompilerNode(node) as KindToNodeMappings[TKind]) : undefined;
  }

  /**
   * Gets the previous sibiling if it matches the specified kind, or throws.
   * @param kind - Kind to check.
   */
  getPreviousSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getPreviousSiblingIfKind(kind),
      message ?? (() => `A previous sibling of kind ${getSyntaxKindName(kind)} was expected.`),
      this,
    );
  }

  /**
   * Gets the next sibiling if it matches the specified kind, or throws.
   * @param kind - Kind to check.
   */
  getNextSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getNextSiblingIfKind(kind),
      message ?? (() => `A next sibling of kind ${getSyntaxKindName(kind)} was expected.`),
      this,
    );
  }

  /**
   * Gets the previous sibling if it matches the specified kind.
   * @param kind - Kind to check.
   */
  getPreviousSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    const previousSibling = this._getCompilerPreviousSibling();
    return previousSibling != null && previousSibling.kind === kind
      ? (this._getNodeFromCompilerNode(previousSibling) as KindToNodeMappings[TKind])
      : undefined;
  }

  /**
   * Gets the next sibling if it matches the specified kind.
   * @param kind - Kind to check.
   */
  getNextSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    const nextSibling = this._getCompilerNextSibling();
    return nextSibling != null && nextSibling.kind === kind ? (this._getNodeFromCompilerNode(nextSibling) as KindToNodeMappings[TKind]) : undefined;
  }

  /**
   * Gets the parent if it matches a certain condition or throws.
   */
  getParentIfOrThrow<T extends Node>(condition: (parent: Node | undefined, node: Node) => parent is T, message?: string | (() => string)): T;
  /**
   * Gets the parent if it matches a certain condition or throws.
   */
  getParentIfOrThrow(condition: (parent: Node | undefined, node: Node) => boolean, message?: string | (() => string)): Node;
  getParentIfOrThrow(condition: (parent: Node | undefined, node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getParentIf(condition), message ?? "The parent did not match the provided condition.", this);
  }

  /**
   * Gets the parent if it matches a certain condition.
   */
  getParentIf<T extends Node>(condition: (parent: Node | undefined, node: Node) => parent is T): T | undefined;
  /**
   * Gets the parent if it matches a certain condition.
   */
  getParentIf(condition: (parent: Node | undefined, node: Node) => boolean): Node | undefined;
  getParentIf(condition: (parent: Node | undefined, node: Node) => boolean) {
    return condition(this.getParent(), this) ? this.getParent() : undefined;
  }

  /**
   * Gets the parent if it's a certain syntax kind or throws.
   */
  getParentIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind] {
    return errors.throwIfNullOrUndefined(
      this.getParentIfKind(kind),
      message ?? (() => `The parent was not a syntax kind of ${getSyntaxKindName(kind)}.`),
      this,
    );
  }

  /**
   * Gets the parent if it's a certain syntax kind.
   */
  getParentIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    return this.getParentIf(n => n !== undefined && n.getKind() === kind) as KindToNodeMappings[TKind] | undefined;
  }

  /**
   * Gets the first ancestor by syntax kind or throws if not found.
   * @param kind - Syntax kind.
   */
  getFirstAncestorByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind] {
    return errors.throwIfNullOrUndefined(
      this.getFirstAncestorByKind(kind),
      message ?? (() => `Expected an ancestor with a syntax kind of ${getSyntaxKindName(kind)}.`),
      this,
    );
  }

  /**
   * Get the first ancestor by syntax kind.
   * @param kind - Syntax kind.
   */
  getFirstAncestorByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    for (const parent of this._getAncestorsIterator(kind === SyntaxKind.SyntaxList)) {
      if (parent.getKind() === kind)
        return parent as KindToNodeMappings[TKind];
    }
    return undefined;
  }

  /**
   * Gets the first ancestor that matches the provided condition or throws if not found.
   * @param condition - Condition to match.
   */
  getFirstAncestorOrThrow<T extends Node>(condition?: (node: Node) => node is T): T;
  /**
   * Gets the first ancestor that matches the provided condition or throws if not found.
   * @param condition - Condition to match.
   */
  getFirstAncestorOrThrow(condition?: (node: Node) => boolean): Node;
  getFirstAncestorOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getFirstAncestor(condition),
      message ?? `Expected to find an ancestor that matched the provided condition.`,
      this,
    );
  }

  /**
   * Gets the first ancestor that matches the provided condition or returns undefined if not found.
   * @param condition - Condition to match.
   */
  getFirstAncestor<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
  /**
   * Gets the first ancestor that matches the provided condition or returns undefined if not found.
   * @param condition - Condition to match.
   */
  getFirstAncestor(condition?: (node: Node) => boolean): Node | undefined;
  getFirstAncestor(condition?: (node: Node) => boolean) {
    for (const ancestor of this._getAncestorsIterator(false)) {
      if (condition == null || condition(ancestor))
        return ancestor;
    }
    return undefined;
  }

  /**
   * Gets the descendants that match a specified syntax kind.
   * @param kind - Kind to check.
   */
  getDescendantsOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][] {
    const descendants: KindToNodeMappings[TKind][] = [];
    for (const descendant of this._getCompilerDescendantsOfKindIterator(kind))
      descendants.push(this._getNodeFromCompilerNode(descendant) as KindToNodeMappings[TKind]);
    return descendants;
  }

  /**
   * Gets the first descendant by syntax kind or throws.
   * @param kind - Syntax kind.
   */
  getFirstDescendantByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getFirstDescendantByKind(kind),
      message ?? (() => `A descendant of kind ${getSyntaxKindName(kind)} was expected to be found.`),
      this,
    );
  }

  /**
   * Gets the first descendant by syntax kind.
   * @param kind - Syntax kind.
   */
  getFirstDescendantByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
    for (const descendant of this._getCompilerDescendantsOfKindIterator(kind))
      return this._getNodeFromCompilerNode(descendant) as KindToNodeMappings[TKind];
    return undefined;
  }

  /**
   * Gets the compiler children of the node.
   * @internal
   */
  _getCompilerChildren(): ts.Node[] {
    return ExtendedParser.getCompilerChildren(this.compilerNode, this._sourceFile.compilerNode);
  }

  /**
   * Gets the compiler children of the node using .forEachChild
   * @internal
   */
  _getCompilerForEachChildren(): ts.Node[] {
    return ExtendedParser.getCompilerForEachChildren(this.compilerNode, this._sourceFile.compilerNode);
  }

  /**
   * Gets children using forEachChildren if it has no parsed tokens, otherwise getChildren.
   * @internal
   */
  _getCompilerChildrenFast() {
    return hasParsedTokens(this.compilerNode) ? this._getCompilerChildren() : this._getCompilerForEachChildren();
  }

  /**
   * Gets the compiler children of the specified kind.
   * @internal
   */
  _getCompilerChildrenOfKind(kind: SyntaxKind) {
    const children: ts.Node[] = useParseTreeSearchForKind(this, kind) ? this._getCompilerForEachChildren() : this._getCompilerChildren();
    return children.filter(c => c.kind === kind);
  }

  /**
   * Gets the node's descendant compiler nodes filtered by syntax kind, based on an iterator.
   * @internal
   */
  *_getCompilerDescendantsOfKindIterator(kind: SyntaxKind): IterableIterator<ts.Node> {
    // if the first node is a SyntaxList then always use `.getCompilerChildren()`... after that go back to the appropriate search method
    const children = useParseTreeSearchForKind(this, kind) ? this._getCompilerForEachChildren() : this._getCompilerChildren();

    for (const child of children) {
      if (child.kind === kind)
        yield child;

      const descendants = useParseTreeSearchForKind(child.kind, kind)
        ? getCompilerForEachDescendantsIterator(child)
        : getCompilerDescendantsIterator(child, this._sourceFile.compilerNode);

      for (const descendant of descendants) {
        if (descendant.kind === kind)
          yield descendant;
      }
    }
  }

  /**
   * Gets the node's descendant compiler nodes as an iterator.
   * @internal
   */
  _getCompilerDescendantsIterator(): IterableIterator<ts.Node> {
    return getCompilerDescendantsIterator(this.compilerNode, this._sourceFile.compilerNode);
  }

  /**
   * Gets the node's for-each descendant compiler nodes as an iterator.
   * @internal
   */
  _getCompilerForEachDescendantsIterator(): IterableIterator<ts.Node> {
    return getCompilerForEachDescendantsIterator(this.compilerNode);
  }

  /**
   * Gets the first compiler node child that matches the condition.
   * @param condition - Condition.
   * @internal
   */
  _getCompilerFirstChild(condition?: (node: ts.Node) => boolean) {
    for (const child of this._getCompilerChildren()) {
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
  _getCompilerLastChild(condition?: (node: ts.Node) => boolean) {
    const children = this._getCompilerChildren();
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
  _getCompilerPreviousSiblings() {
    const parent = this.getParentSyntaxList() || this.getParentOrThrow();
    const previousSiblings: ts.Node[] = [];

    for (const child of parent._getCompilerChildren()) {
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
  _getCompilerNextSiblings() {
    let foundChild = false;
    const parent = this.getParentSyntaxList() || this.getParentOrThrow();
    const nextSiblings: ts.Node[] = [];

    for (const child of parent._getCompilerChildren()) {
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
  _getCompilerPreviousSibling(condition?: (node: ts.Node) => boolean) {
    for (const sibling of this._getCompilerPreviousSiblings()) {
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
  _getCompilerNextSibling(condition?: (node: ts.Node) => boolean) {
    for (const sibling of this._getCompilerNextSiblings()) {
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
  _getCompilerChildAtIndex(index: number) {
    const children = this._getCompilerChildren();
    errors.throwIfOutOfRange(index, [0, children.length - 1], "index");
    return children[index];
  }

  /**
   * Gets a writer with the indentation text.
   * @internal
   */
  _getWriterWithIndentation() {
    const writer = this._getWriter();
    writer.setIndentationLevel(this.getIndentationLevel());
    return writer;
  }

  /**
   * Gets a writer with the queued indentation text.
   * @internal
   */
  _getWriterWithQueuedIndentation() {
    const writer = this._getWriter();
    writer.queueIndentationLevel(this.getIndentationLevel());
    return writer;
  }

  /**
   * Gets a writer with the child indentation text.
   * @internal
   */
  _getWriterWithChildIndentation() {
    const writer = this._getWriter();
    writer.setIndentationLevel(this.getChildIndentationLevel());
    return writer;
  }

  /**
   * Gets a writer with the queued child indentation text.
   * @internal
   */
  _getWriterWithQueuedChildIndentation() {
    const writer = this._getWriter();
    writer.queueIndentationLevel(this.getChildIndentationLevel());
    return writer;
  }

  /** @internal */
  _getTextWithQueuedChildIndentation(textOrWriterFunc: string | WriterFunction) {
    const writer = this._getWriterWithQueuedChildIndentation();
    if (typeof textOrWriterFunc === "string")
      writer.write(textOrWriterFunc);
    else
      textOrWriterFunc(writer);
    return writer.toString();
  }

  /**
   * Gets a writer with no child indentation text.
   * @internal
   */
  _getWriter() {
    return this._context.createWriter();
  }

  /**
   * Gets or creates a node from the internal cache.
   * @internal
   */
  _getNodeFromCompilerNode<LocalCompilerNodeType extends ts.Node = ts.Node>(
    compilerNode: LocalCompilerNodeType,
  ): CompilerNodeToWrappedType<LocalCompilerNodeType> {
    return this._context.compilerFactory.getNodeFromCompilerNode(compilerNode, this._sourceFile);
  }

  /**
   * Gets or creates a node from the internal cache, if it exists.
   * @internal
   */
  _getNodeFromCompilerNodeIfExists<LocalCompilerNodeType extends ts.Node = ts.Node>(
    compilerNode: LocalCompilerNodeType | undefined,
  ): CompilerNodeToWrappedType<LocalCompilerNodeType> | undefined {
    return compilerNode == null ? undefined : this._getNodeFromCompilerNode<LocalCompilerNodeType>(compilerNode);
  }

  /**
   * Ensures that the binder has bound the node before.
   * @internal
   */
  protected _ensureBound() {
    if ((this.compilerNode as any).symbol != null)
      return;
    this.getSymbol(); // binds the node
  }

  /**
   * Gets if the node has an expression.
   * @param node - Node to check.
   */
  static hasExpression<T extends compiler.Node>(node: T): node is T & { getExpression(): compiler.Expression } {
    // this method is manually maintained
    return (node as any).getExpression?.() != null;
  }

  /**
   * Gets if the node has a name.
   * @param node - Node to check.
   */
  static hasName<T extends compiler.Node>(node: T): node is T & { getName(): string; getNameNode(): compiler.Node } {
    // this method is manually maintained
    return typeof (node as any).getName?.() === "string";
  }

  /**
   * Gets if the node has a body.
   * @param node - Node to check.
   */
  static hasBody<T extends compiler.Node>(node: T): node is T & { getBody(): compiler.Node } {
    // this method is manually maintained
    return (node as any).getBody?.() != null;
  }

  /**
   * Gets if the node has a structure.
   * @param node - Node to check.
   */
  static hasStructure<T extends compiler.Node>(node: T): node is T & { getStructure(): Structures } {
    // this method is manually maintained
    return typeof (node as any).getStructure === "function";
  }

  /** Creates a type guard for syntax kinds. */
  static is<TKind extends keyof KindToNodeMappings>(kind: TKind): (node: compiler.Node | undefined) => node is KindToNodeMappings[TKind] {
    return (node: compiler.Node | undefined): node is KindToNodeMappings[TKind] => {
      return node?.getKind() == kind;
    };
  }

  /** Gets if the provided value is a Node. */
  static isNode(value: unknown): value is compiler.Node {
    return value != null && (value as any).compilerNode != null;
  }

  /** Gets if the provided node is a comment node. */
  static isCommentNode(node: compiler.Node | undefined): node is compiler.CommentStatement | compiler.CommentClassElement | compiler.CommentTypeElement | compiler.CommentObjectLiteralElement | compiler.CommentEnumMember {
    const kind = node?.getKind();
    return kind === SyntaxKind.SingleLineCommentTrivia || kind === SyntaxKind.MultiLineCommentTrivia;
  }

  /** Gets if the provided node is a CommentStatement. */
  static isCommentStatement(node: compiler.Node | undefined): node is compiler.CommentStatement {
    return (node?.compilerNode as compiler.CompilerCommentStatement)?._commentKind === compiler.CommentNodeKind.Statement;
  }

  /** Gets if the provided node is a CommentClassElement. */
  static isCommentClassElement(node: compiler.Node | undefined): node is compiler.CommentClassElement {
    return (node?.compilerNode as compiler.CompilerCommentClassElement)?._commentKind === compiler.CommentNodeKind.ClassElement;
  }

  /** Gets if the provided value is a CommentTypeElement. */
  static isCommentTypeElement(node: compiler.Node | undefined): node is compiler.CommentTypeElement {
    return (node?.compilerNode as compiler.CompilerCommentTypeElement)?._commentKind === compiler.CommentNodeKind.TypeElement;
  }

  /** Gets if the provided node is a CommentObjectLiteralElement. */
  static isCommentObjectLiteralElement(node: compiler.Node | undefined): node is compiler.CommentObjectLiteralElement {
    return (node?.compilerNode as compiler.CompilerCommentObjectLiteralElement)?._commentKind === compiler.CommentNodeKind.ObjectLiteralElement;
  }

  /** Gets if the provided node is a CommentEnumMember. */
  static isCommentEnumMember(node: compiler.Node | undefined): node is compiler.CommentEnumMember {
    return (node?.compilerNode as compiler.CompilerCommentEnumMember)?._commentKind == compiler.CommentNodeKind.EnumMember;
  }

  /** Gets if the node is an AbstractableNode. */
  static isAbstractable<T extends compiler.Node>(node: T | undefined): node is compiler.AbstractableNode & compiler.AbstractableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.ConstructorType:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an AmbientableNode. */
  static isAmbientable<T extends compiler.Node>(node: T | undefined): node is compiler.AmbientableNode & compiler.AmbientableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.VariableStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an AnyKeyword. */
  static readonly isAnyKeyword: (node: compiler.Node | undefined) => node is compiler.Expression = Node.is(SyntaxKind.AnyKeyword);

  /** Gets if the node is an ArgumentedNode. */
  static isArgumented<T extends compiler.Node>(node: T | undefined): node is compiler.ArgumentedNode & compiler.ArgumentedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.CallExpression:
      case SyntaxKind.NewExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ArrayBindingPattern. */
  static readonly isArrayBindingPattern: (node: compiler.Node | undefined) => node is compiler.ArrayBindingPattern = Node.is(SyntaxKind.ArrayBindingPattern);
  /** Gets if the node is an ArrayLiteralExpression. */
  static readonly isArrayLiteralExpression: (node: compiler.Node | undefined) => node is compiler.ArrayLiteralExpression = Node.is(SyntaxKind.ArrayLiteralExpression);

  /** Gets if the node is an ArrayTypeNode. */
  static isArrayTypeNode(node: compiler.Node | undefined): node is compiler.ArrayTypeNode {
    return node?.getKind() === SyntaxKind.ArrayType;
  }

  /** Gets if the node is an ArrowFunction. */
  static readonly isArrowFunction: (node: compiler.Node | undefined) => node is compiler.ArrowFunction = Node.is(SyntaxKind.ArrowFunction);
  /** Gets if the node is an AsExpression. */
  static readonly isAsExpression: (node: compiler.Node | undefined) => node is compiler.AsExpression = Node.is(SyntaxKind.AsExpression);

  /** Gets if the node is an AsyncableNode. */
  static isAsyncable<T extends compiler.Node>(node: T | undefined): node is compiler.AsyncableNode & compiler.AsyncableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.MethodDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an AwaitableNode. */
  static isAwaitable<T extends compiler.Node>(node: T | undefined): node is compiler.AwaitableNode & compiler.AwaitableNodeExtensionType & T {
    return node?.getKind() === SyntaxKind.ForOfStatement;
  }

  /** Gets if the node is an AwaitExpression. */
  static readonly isAwaitExpression: (node: compiler.Node | undefined) => node is compiler.AwaitExpression = Node.is(SyntaxKind.AwaitExpression);
  /** Gets if the node is a BigIntLiteral. */
  static readonly isBigIntLiteral: (node: compiler.Node | undefined) => node is compiler.BigIntLiteral = Node.is(SyntaxKind.BigIntLiteral);
  /** Gets if the node is a BinaryExpression. */
  static readonly isBinaryExpression: (node: compiler.Node | undefined) => node is compiler.BinaryExpression = Node.is(SyntaxKind.BinaryExpression);
  /** Gets if the node is a BindingElement. */
  static readonly isBindingElement: (node: compiler.Node | undefined) => node is compiler.BindingElement = Node.is(SyntaxKind.BindingElement);

  /** Gets if the node is a BindingNamedNode. */
  static isBindingNamed<T extends compiler.Node>(node: T | undefined): node is compiler.BindingNamedNode & compiler.BindingNamedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.BindingElement:
      case SyntaxKind.Parameter:
      case SyntaxKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a Block. */
  static readonly isBlock: (node: compiler.Node | undefined) => node is compiler.Block = Node.is(SyntaxKind.Block);

  /** Gets if the node is a BodiedNode. */
  static isBodied<T extends compiler.Node>(node: T | undefined): node is compiler.BodiedNode & compiler.BodiedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.ClassStaticBlockDeclaration:
      case SyntaxKind.FunctionExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a BodyableNode. */
  static isBodyable<T extends compiler.Node>(node: T | undefined): node is compiler.BodyableNode & compiler.BodyableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.Constructor:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a BooleanKeyword. */
  static readonly isBooleanKeyword: (node: compiler.Node | undefined) => node is compiler.Expression = Node.is(SyntaxKind.BooleanKeyword);
  /** Gets if the node is a BreakStatement. */
  static readonly isBreakStatement: (node: compiler.Node | undefined) => node is compiler.BreakStatement = Node.is(SyntaxKind.BreakStatement);
  /** Gets if the node is a CallExpression. */
  static readonly isCallExpression: (node: compiler.Node | undefined) => node is compiler.CallExpression = Node.is(SyntaxKind.CallExpression);

  /** Gets if the node is a CallSignatureDeclaration. */
  static isCallSignatureDeclaration(node: compiler.Node | undefined): node is compiler.CallSignatureDeclaration {
    return node?.getKind() === SyntaxKind.CallSignature;
  }

  /** Gets if the node is a CaseBlock. */
  static readonly isCaseBlock: (node: compiler.Node | undefined) => node is compiler.CaseBlock = Node.is(SyntaxKind.CaseBlock);
  /** Gets if the node is a CaseClause. */
  static readonly isCaseClause: (node: compiler.Node | undefined) => node is compiler.CaseClause = Node.is(SyntaxKind.CaseClause);
  /** Gets if the node is a CatchClause. */
  static readonly isCatchClause: (node: compiler.Node | undefined) => node is compiler.CatchClause = Node.is(SyntaxKind.CatchClause);

  /** Gets if the node is a ChildOrderableNode. */
  static isChildOrderable<T extends compiler.Node>(node: T | undefined): node is compiler.ChildOrderableNode & compiler.ChildOrderableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.Block:
      case SyntaxKind.BreakStatement:
      case SyntaxKind.CallSignature:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassStaticBlockDeclaration:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.ContinueStatement:
      case SyntaxKind.DebuggerStatement:
      case SyntaxKind.DoStatement:
      case SyntaxKind.EmptyStatement:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.ExportAssignment:
      case SyntaxKind.ExportDeclaration:
      case SyntaxKind.ExpressionStatement:
      case SyntaxKind.ForInStatement:
      case SyntaxKind.ForOfStatement:
      case SyntaxKind.ForStatement:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.IfStatement:
      case SyntaxKind.ImportDeclaration:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.IndexSignature:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.LabeledStatement:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.ModuleBlock:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.NotEmittedStatement:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.ReturnStatement:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.SwitchStatement:
      case SyntaxKind.ThrowStatement:
      case SyntaxKind.TryStatement:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.VariableStatement:
      case SyntaxKind.WhileStatement:
      case SyntaxKind.WithStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ClassDeclaration. */
  static readonly isClassDeclaration: (node: compiler.Node | undefined) => node is compiler.ClassDeclaration = Node.is(SyntaxKind.ClassDeclaration);
  /** Gets if the node is a ClassExpression. */
  static readonly isClassExpression: (node: compiler.Node | undefined) => node is compiler.ClassExpression = Node.is(SyntaxKind.ClassExpression);

  /** Gets if the node is a ClassLikeDeclarationBase. */
  static isClassLikeDeclarationBase<T extends compiler.Node>(node: T | undefined): node is compiler.ClassLikeDeclarationBase & compiler.ClassLikeDeclarationBaseExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ClassStaticBlockDeclaration. */
  static readonly isClassStaticBlockDeclaration: (node: compiler.Node | undefined) => node is compiler.ClassStaticBlockDeclaration = Node.is(SyntaxKind.ClassStaticBlockDeclaration);
  /** Gets if the node is a CommaListExpression. */
  static readonly isCommaListExpression: (node: compiler.Node | undefined) => node is compiler.CommaListExpression = Node.is(SyntaxKind.CommaListExpression);
  /** Gets if the node is a ComputedPropertyName. */
  static readonly isComputedPropertyName: (node: compiler.Node | undefined) => node is compiler.ComputedPropertyName = Node.is(SyntaxKind.ComputedPropertyName);
  /** Gets if the node is a ConditionalExpression. */
  static readonly isConditionalExpression: (node: compiler.Node | undefined) => node is compiler.ConditionalExpression = Node.is(SyntaxKind.ConditionalExpression);

  /** Gets if the node is a ConditionalTypeNode. */
  static isConditionalTypeNode(node: compiler.Node | undefined): node is compiler.ConditionalTypeNode {
    return node?.getKind() === SyntaxKind.ConditionalType;
  }

  /** Gets if the node is a ConstructorDeclaration. */
  static isConstructorDeclaration(node: compiler.Node | undefined): node is compiler.ConstructorDeclaration {
    return node?.getKind() === SyntaxKind.Constructor;
  }

  /** Gets if the node is a ConstructorTypeNode. */
  static isConstructorTypeNode(node: compiler.Node | undefined): node is compiler.ConstructorTypeNode {
    return node?.getKind() === SyntaxKind.ConstructorType;
  }

  /** Gets if the node is a ConstructSignatureDeclaration. */
  static isConstructSignatureDeclaration(node: compiler.Node | undefined): node is compiler.ConstructSignatureDeclaration {
    return node?.getKind() === SyntaxKind.ConstructSignature;
  }

  /** Gets if the node is a ContinueStatement. */
  static readonly isContinueStatement: (node: compiler.Node | undefined) => node is compiler.ContinueStatement = Node.is(SyntaxKind.ContinueStatement);
  /** Gets if the node is a DebuggerStatement. */
  static readonly isDebuggerStatement: (node: compiler.Node | undefined) => node is compiler.DebuggerStatement = Node.is(SyntaxKind.DebuggerStatement);

  /** Gets if the node is a DecoratableNode. */
  static isDecoratable<T extends compiler.Node>(node: T | undefined): node is compiler.DecoratableNode & compiler.DecoratableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a Decorator. */
  static readonly isDecorator: (node: compiler.Node | undefined) => node is compiler.Decorator = Node.is(SyntaxKind.Decorator);
  /** Gets if the node is a DefaultClause. */
  static readonly isDefaultClause: (node: compiler.Node | undefined) => node is compiler.DefaultClause = Node.is(SyntaxKind.DefaultClause);
  /** Gets if the node is a DeleteExpression. */
  static readonly isDeleteExpression: (node: compiler.Node | undefined) => node is compiler.DeleteExpression = Node.is(SyntaxKind.DeleteExpression);
  /** Gets if the node is a DoStatement. */
  static readonly isDoStatement: (node: compiler.Node | undefined) => node is compiler.DoStatement = Node.is(SyntaxKind.DoStatement);

  /** Gets if the node is a DotDotDotTokenableNode. */
  static isDotDotDotTokenable<T extends compiler.Node>(node: T | undefined): node is compiler.DotDotDotTokenableNode & compiler.DotDotDotTokenableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.BindingElement:
      case SyntaxKind.JsxExpression:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.Parameter:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ElementAccessExpression. */
  static readonly isElementAccessExpression: (node: compiler.Node | undefined) => node is compiler.ElementAccessExpression = Node.is(SyntaxKind.ElementAccessExpression);
  /** Gets if the node is an EmptyStatement. */
  static readonly isEmptyStatement: (node: compiler.Node | undefined) => node is compiler.EmptyStatement = Node.is(SyntaxKind.EmptyStatement);
  /** Gets if the node is an EnumDeclaration. */
  static readonly isEnumDeclaration: (node: compiler.Node | undefined) => node is compiler.EnumDeclaration = Node.is(SyntaxKind.EnumDeclaration);
  /** Gets if the node is an EnumMember. */
  static readonly isEnumMember: (node: compiler.Node | undefined) => node is compiler.EnumMember = Node.is(SyntaxKind.EnumMember);

  /** Gets if the node is an ExclamationTokenableNode. */
  static isExclamationTokenable<T extends compiler.Node>(node: T | undefined): node is compiler.ExclamationTokenableNode & compiler.ExclamationTokenableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ExportableNode. */
  static isExportable<T extends compiler.Node>(node: T | undefined): node is compiler.ExportableNode & compiler.ExportableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.VariableStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ExportAssignment. */
  static readonly isExportAssignment: (node: compiler.Node | undefined) => node is compiler.ExportAssignment = Node.is(SyntaxKind.ExportAssignment);
  /** Gets if the node is an ExportDeclaration. */
  static readonly isExportDeclaration: (node: compiler.Node | undefined) => node is compiler.ExportDeclaration = Node.is(SyntaxKind.ExportDeclaration);

  /** Gets if the node is an ExportGetableNode. */
  static isExportGetable<T extends compiler.Node>(node: T | undefined): node is compiler.ExportGetableNode & compiler.ExportGetableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.VariableDeclaration:
      case SyntaxKind.VariableStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ExportSpecifier. */
  static readonly isExportSpecifier: (node: compiler.Node | undefined) => node is compiler.ExportSpecifier = Node.is(SyntaxKind.ExportSpecifier);

  /** Gets if the node is an Expression. */
  static isExpression(node: compiler.Node | undefined): node is compiler.Expression {
    switch (node?.getKind()) {
      case SyntaxKind.AnyKeyword:
      case SyntaxKind.BooleanKeyword:
      case SyntaxKind.NumberKeyword:
      case SyntaxKind.ObjectKeyword:
      case SyntaxKind.StringKeyword:
      case SyntaxKind.SymbolKeyword:
      case SyntaxKind.UndefinedKeyword:
      case SyntaxKind.ArrayLiteralExpression:
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.AsExpression:
      case SyntaxKind.AwaitExpression:
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.BinaryExpression:
      case SyntaxKind.CallExpression:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.CommaListExpression:
      case SyntaxKind.ConditionalExpression:
      case SyntaxKind.DeleteExpression:
      case SyntaxKind.ElementAccessExpression:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportKeyword:
      case SyntaxKind.JsxClosingFragment:
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxExpression:
      case SyntaxKind.JsxFragment:
      case SyntaxKind.JsxOpeningElement:
      case SyntaxKind.JsxOpeningFragment:
      case SyntaxKind.JsxSelfClosingElement:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.NewExpression:
      case SyntaxKind.NonNullExpression:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NullKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.ObjectLiteralExpression:
      case SyntaxKind.OmittedExpression:
      case SyntaxKind.ParenthesizedExpression:
      case SyntaxKind.PartiallyEmittedExpression:
      case SyntaxKind.PostfixUnaryExpression:
      case SyntaxKind.PrefixUnaryExpression:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.SatisfiesExpression:
      case SyntaxKind.SpreadElement:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.SuperKeyword:
      case SyntaxKind.TaggedTemplateExpression:
      case SyntaxKind.TemplateExpression:
      case SyntaxKind.ThisKeyword:
      case SyntaxKind.TrueKeyword:
      case SyntaxKind.TypeAssertionExpression:
      case SyntaxKind.TypeOfExpression:
      case SyntaxKind.VoidExpression:
      case SyntaxKind.YieldExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ExpressionableNode. */
  static isExpressionable<T extends compiler.Node>(node: T | undefined): node is compiler.ExpressionableNode & compiler.ExpressionableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ExternalModuleReference:
      case SyntaxKind.JsxExpression:
      case SyntaxKind.ReturnStatement:
      case SyntaxKind.YieldExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ExpressionedNode. */
  static isExpressioned<T extends compiler.Node>(node: T | undefined): node is compiler.ExpressionedNode & compiler.ExpressionedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.AsExpression:
      case SyntaxKind.CaseClause:
      case SyntaxKind.ComputedPropertyName:
      case SyntaxKind.DoStatement:
      case SyntaxKind.ExportAssignment:
      case SyntaxKind.ExpressionStatement:
      case SyntaxKind.ForInStatement:
      case SyntaxKind.ForOfStatement:
      case SyntaxKind.IfStatement:
      case SyntaxKind.JsxSpreadAttribute:
      case SyntaxKind.NonNullExpression:
      case SyntaxKind.ParenthesizedExpression:
      case SyntaxKind.PartiallyEmittedExpression:
      case SyntaxKind.SatisfiesExpression:
      case SyntaxKind.SpreadAssignment:
      case SyntaxKind.SpreadElement:
      case SyntaxKind.SwitchStatement:
      case SyntaxKind.TemplateSpan:
      case SyntaxKind.ThrowStatement:
      case SyntaxKind.WhileStatement:
      case SyntaxKind.WithStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is an ExpressionStatement. */
  static readonly isExpressionStatement: (node: compiler.Node | undefined) => node is compiler.ExpressionStatement = Node.is(SyntaxKind.ExpressionStatement);
  /** Gets if the node is an ExpressionWithTypeArguments. */
  static readonly isExpressionWithTypeArguments: (node: compiler.Node | undefined) => node is compiler.ExpressionWithTypeArguments = Node.is(SyntaxKind.ExpressionWithTypeArguments);

  /** Gets if the node is an ExtendsClauseableNode. */
  static isExtendsClauseable<T extends compiler.Node>(node: T | undefined): node is compiler.ExtendsClauseableNode & compiler.ExtendsClauseableNodeExtensionType & T {
    return node?.getKind() === SyntaxKind.InterfaceDeclaration;
  }

  /** Gets if the node is an ExternalModuleReference. */
  static readonly isExternalModuleReference: (node: compiler.Node | undefined) => node is compiler.ExternalModuleReference = Node.is(SyntaxKind.ExternalModuleReference);

  /** Gets if the node is a FalseLiteral. */
  static isFalseLiteral(node: compiler.Node | undefined): node is compiler.FalseLiteral {
    return node?.getKind() === SyntaxKind.FalseKeyword;
  }

  /** Gets if the node is a ForInStatement. */
  static readonly isForInStatement: (node: compiler.Node | undefined) => node is compiler.ForInStatement = Node.is(SyntaxKind.ForInStatement);
  /** Gets if the node is a ForOfStatement. */
  static readonly isForOfStatement: (node: compiler.Node | undefined) => node is compiler.ForOfStatement = Node.is(SyntaxKind.ForOfStatement);
  /** Gets if the node is a ForStatement. */
  static readonly isForStatement: (node: compiler.Node | undefined) => node is compiler.ForStatement = Node.is(SyntaxKind.ForStatement);
  /** Gets if the node is a FunctionDeclaration. */
  static readonly isFunctionDeclaration: (node: compiler.Node | undefined) => node is compiler.FunctionDeclaration = Node.is(SyntaxKind.FunctionDeclaration);
  /** Gets if the node is a FunctionExpression. */
  static readonly isFunctionExpression: (node: compiler.Node | undefined) => node is compiler.FunctionExpression = Node.is(SyntaxKind.FunctionExpression);

  /** Gets if the node is a FunctionLikeDeclaration. */
  static isFunctionLikeDeclaration<T extends compiler.Node>(node: T | undefined): node is compiler.FunctionLikeDeclaration & compiler.FunctionLikeDeclarationExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.Constructor:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a FunctionTypeNode. */
  static isFunctionTypeNode(node: compiler.Node | undefined): node is compiler.FunctionTypeNode {
    return node?.getKind() === SyntaxKind.FunctionType;
  }

  /** Gets if the node is a GeneratorableNode. */
  static isGeneratorable<T extends compiler.Node>(node: T | undefined): node is compiler.GeneratorableNode & compiler.GeneratorableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.YieldExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a GetAccessorDeclaration. */
  static isGetAccessorDeclaration(node: compiler.Node | undefined): node is compiler.GetAccessorDeclaration {
    return node?.getKind() === SyntaxKind.GetAccessor;
  }

  /** Gets if the node is a HeritageClause. */
  static readonly isHeritageClause: (node: compiler.Node | undefined) => node is compiler.HeritageClause = Node.is(SyntaxKind.HeritageClause);

  /** Gets if the node is a HeritageClauseableNode. */
  static isHeritageClauseable<T extends compiler.Node>(node: T | undefined): node is compiler.HeritageClauseableNode & compiler.HeritageClauseableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.InterfaceDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a Identifier. */
  static readonly isIdentifier: (node: compiler.Node | undefined) => node is compiler.Identifier = Node.is(SyntaxKind.Identifier);
  /** Gets if the node is a IfStatement. */
  static readonly isIfStatement: (node: compiler.Node | undefined) => node is compiler.IfStatement = Node.is(SyntaxKind.IfStatement);

  /** Gets if the node is a ImplementsClauseableNode. */
  static isImplementsClauseable<T extends compiler.Node>(node: T | undefined): node is compiler.ImplementsClauseableNode & compiler.ImplementsClauseableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ImportAttribute. */
  static readonly isImportAttribute: (node: compiler.Node | undefined) => node is compiler.ImportAttribute = Node.is(SyntaxKind.ImportAttribute);

  /** Gets if the node is a ImportAttributeNamedNode. */
  static isImportAttributeNamed<T extends compiler.Node>(node: T | undefined): node is compiler.ImportAttributeNamedNode & compiler.ImportAttributeNamedNodeExtensionType & T {
    return node?.getKind() === SyntaxKind.ImportAttribute;
  }

  /** Gets if the node is a ImportAttributes. */
  static readonly isImportAttributes: (node: compiler.Node | undefined) => node is compiler.ImportAttributes = Node.is(SyntaxKind.ImportAttributes);
  /** Gets if the node is a ImportClause. */
  static readonly isImportClause: (node: compiler.Node | undefined) => node is compiler.ImportClause = Node.is(SyntaxKind.ImportClause);
  /** Gets if the node is a ImportDeclaration. */
  static readonly isImportDeclaration: (node: compiler.Node | undefined) => node is compiler.ImportDeclaration = Node.is(SyntaxKind.ImportDeclaration);
  /** Gets if the node is a ImportEqualsDeclaration. */
  static readonly isImportEqualsDeclaration: (node: compiler.Node | undefined) => node is compiler.ImportEqualsDeclaration = Node.is(SyntaxKind.ImportEqualsDeclaration);

  /** Gets if the node is a ImportExpression. */
  static isImportExpression(node: compiler.Node | undefined): node is compiler.ImportExpression {
    return node?.getKind() === SyntaxKind.ImportKeyword;
  }

  /** Gets if the node is a ImportSpecifier. */
  static readonly isImportSpecifier: (node: compiler.Node | undefined) => node is compiler.ImportSpecifier = Node.is(SyntaxKind.ImportSpecifier);

  /** Gets if the node is a ImportTypeNode. */
  static isImportTypeNode(node: compiler.Node | undefined): node is compiler.ImportTypeNode {
    return node?.getKind() === SyntaxKind.ImportType;
  }

  /** Gets if the node is a IndexedAccessTypeNode. */
  static isIndexedAccessTypeNode(node: compiler.Node | undefined): node is compiler.IndexedAccessTypeNode {
    return node?.getKind() === SyntaxKind.IndexedAccessType;
  }

  /** Gets if the node is a IndexSignatureDeclaration. */
  static isIndexSignatureDeclaration(node: compiler.Node | undefined): node is compiler.IndexSignatureDeclaration {
    return node?.getKind() === SyntaxKind.IndexSignature;
  }

  /** Gets if the node is a InferKeyword. */
  static readonly isInferKeyword: (node: compiler.Node | undefined) => node is compiler.Node<ts.Token<SyntaxKind.InferKeyword>> = Node.is(SyntaxKind.InferKeyword);

  /** Gets if the node is a InferTypeNode. */
  static isInferTypeNode(node: compiler.Node | undefined): node is compiler.InferTypeNode {
    return node?.getKind() === SyntaxKind.InferType;
  }

  /** Gets if the node is a InitializerExpressionableNode. */
  static isInitializerExpressionable<T extends compiler.Node>(node: T | undefined): node is compiler.InitializerExpressionableNode & compiler.InitializerExpressionableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.BindingElement:
      case SyntaxKind.EnumMember:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a InitializerExpressionGetableNode. */
  static isInitializerExpressionGetable<T extends compiler.Node>(node: T | undefined): node is compiler.InitializerExpressionGetableNode & compiler.InitializerExpressionGetableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.BindingElement:
      case SyntaxKind.EnumMember:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyAssignment:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.ShorthandPropertyAssignment:
      case SyntaxKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a InterfaceDeclaration. */
  static readonly isInterfaceDeclaration: (node: compiler.Node | undefined) => node is compiler.InterfaceDeclaration = Node.is(SyntaxKind.InterfaceDeclaration);

  /** Gets if the node is a IntersectionTypeNode. */
  static isIntersectionTypeNode(node: compiler.Node | undefined): node is compiler.IntersectionTypeNode {
    return node?.getKind() === SyntaxKind.IntersectionType;
  }

  /** Gets if the node is a IterationStatement. */
  static isIterationStatement(node: compiler.Node | undefined): node is compiler.IterationStatement {
    switch (node?.getKind()) {
      case SyntaxKind.DoStatement:
      case SyntaxKind.ForInStatement:
      case SyntaxKind.ForOfStatement:
      case SyntaxKind.ForStatement:
      case SyntaxKind.WhileStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JSDoc. */
  static readonly isJSDoc: (node: compiler.Node | undefined) => node is compiler.JSDoc = Node.is(SyntaxKind.JSDoc);

  /** Gets if the node is a JSDocableNode. */
  static isJSDocable<T extends compiler.Node>(node: T | undefined): node is compiler.JSDocableNode & compiler.JSDocableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.CallSignature:
      case SyntaxKind.CaseClause:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.ClassStaticBlockDeclaration:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.EnumMember:
      case SyntaxKind.ExportAssignment:
      case SyntaxKind.ExpressionStatement:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.IndexSignature:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.LabeledStatement:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.VariableStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JSDocAllType. */
  static readonly isJSDocAllType: (node: compiler.Node | undefined) => node is compiler.JSDocAllType = Node.is(SyntaxKind.JSDocAllType);
  /** Gets if the node is a JSDocAugmentsTag. */
  static readonly isJSDocAugmentsTag: (node: compiler.Node | undefined) => node is compiler.JSDocAugmentsTag = Node.is(SyntaxKind.JSDocAugmentsTag);
  /** Gets if the node is a JSDocAuthorTag. */
  static readonly isJSDocAuthorTag: (node: compiler.Node | undefined) => node is compiler.JSDocAuthorTag = Node.is(SyntaxKind.JSDocAuthorTag);
  /** Gets if the node is a JSDocCallbackTag. */
  static readonly isJSDocCallbackTag: (node: compiler.Node | undefined) => node is compiler.JSDocCallbackTag = Node.is(SyntaxKind.JSDocCallbackTag);
  /** Gets if the node is a JSDocClassTag. */
  static readonly isJSDocClassTag: (node: compiler.Node | undefined) => node is compiler.JSDocClassTag = Node.is(SyntaxKind.JSDocClassTag);
  /** Gets if the node is a JSDocDeprecatedTag. */
  static readonly isJSDocDeprecatedTag: (node: compiler.Node | undefined) => node is compiler.JSDocDeprecatedTag = Node.is(SyntaxKind.JSDocDeprecatedTag);
  /** Gets if the node is a JSDocEnumTag. */
  static readonly isJSDocEnumTag: (node: compiler.Node | undefined) => node is compiler.JSDocEnumTag = Node.is(SyntaxKind.JSDocEnumTag);
  /** Gets if the node is a JSDocFunctionType. */
  static readonly isJSDocFunctionType: (node: compiler.Node | undefined) => node is compiler.JSDocFunctionType = Node.is(SyntaxKind.JSDocFunctionType);
  /** Gets if the node is a JSDocImplementsTag. */
  static readonly isJSDocImplementsTag: (node: compiler.Node | undefined) => node is compiler.JSDocImplementsTag = Node.is(SyntaxKind.JSDocImplementsTag);
  /** Gets if the node is a JSDocLink. */
  static readonly isJSDocLink: (node: compiler.Node | undefined) => node is compiler.JSDocLink = Node.is(SyntaxKind.JSDocLink);
  /** Gets if the node is a JSDocLinkCode. */
  static readonly isJSDocLinkCode: (node: compiler.Node | undefined) => node is compiler.JSDocLinkCode = Node.is(SyntaxKind.JSDocLinkCode);
  /** Gets if the node is a JSDocLinkPlain. */
  static readonly isJSDocLinkPlain: (node: compiler.Node | undefined) => node is compiler.JSDocLinkPlain = Node.is(SyntaxKind.JSDocLinkPlain);
  /** Gets if the node is a JSDocMemberName. */
  static readonly isJSDocMemberName: (node: compiler.Node | undefined) => node is compiler.JSDocMemberName = Node.is(SyntaxKind.JSDocMemberName);
  /** Gets if the node is a JSDocNamepathType. */
  static readonly isJSDocNamepathType: (node: compiler.Node | undefined) => node is compiler.JSDocNamepathType = Node.is(SyntaxKind.JSDocNamepathType);
  /** Gets if the node is a JSDocNameReference. */
  static readonly isJSDocNameReference: (node: compiler.Node | undefined) => node is compiler.JSDocNameReference = Node.is(SyntaxKind.JSDocNameReference);
  /** Gets if the node is a JSDocNonNullableType. */
  static readonly isJSDocNonNullableType: (node: compiler.Node | undefined) => node is compiler.JSDocNonNullableType = Node.is(SyntaxKind.JSDocNonNullableType);
  /** Gets if the node is a JSDocNullableType. */
  static readonly isJSDocNullableType: (node: compiler.Node | undefined) => node is compiler.JSDocNullableType = Node.is(SyntaxKind.JSDocNullableType);
  /** Gets if the node is a JSDocOptionalType. */
  static readonly isJSDocOptionalType: (node: compiler.Node | undefined) => node is compiler.JSDocOptionalType = Node.is(SyntaxKind.JSDocOptionalType);
  /** Gets if the node is a JSDocOverloadTag. */
  static readonly isJSDocOverloadTag: (node: compiler.Node | undefined) => node is compiler.JSDocOverloadTag = Node.is(SyntaxKind.JSDocOverloadTag);
  /** Gets if the node is a JSDocOverrideTag. */
  static readonly isJSDocOverrideTag: (node: compiler.Node | undefined) => node is compiler.JSDocOverrideTag = Node.is(SyntaxKind.JSDocOverrideTag);
  /** Gets if the node is a JSDocParameterTag. */
  static readonly isJSDocParameterTag: (node: compiler.Node | undefined) => node is compiler.JSDocParameterTag = Node.is(SyntaxKind.JSDocParameterTag);
  /** Gets if the node is a JSDocPrivateTag. */
  static readonly isJSDocPrivateTag: (node: compiler.Node | undefined) => node is compiler.JSDocPrivateTag = Node.is(SyntaxKind.JSDocPrivateTag);

  /** Gets if the node is a JSDocPropertyLikeTag. */
  static isJSDocPropertyLikeTag<T extends compiler.Node>(node: T | undefined): node is compiler.JSDocPropertyLikeTag & compiler.JSDocPropertyLikeTagExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.JSDocParameterTag:
      case SyntaxKind.JSDocPropertyTag:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JSDocPropertyTag. */
  static readonly isJSDocPropertyTag: (node: compiler.Node | undefined) => node is compiler.JSDocPropertyTag = Node.is(SyntaxKind.JSDocPropertyTag);
  /** Gets if the node is a JSDocProtectedTag. */
  static readonly isJSDocProtectedTag: (node: compiler.Node | undefined) => node is compiler.JSDocProtectedTag = Node.is(SyntaxKind.JSDocProtectedTag);
  /** Gets if the node is a JSDocPublicTag. */
  static readonly isJSDocPublicTag: (node: compiler.Node | undefined) => node is compiler.JSDocPublicTag = Node.is(SyntaxKind.JSDocPublicTag);
  /** Gets if the node is a JSDocReadonlyTag. */
  static readonly isJSDocReadonlyTag: (node: compiler.Node | undefined) => node is compiler.JSDocReadonlyTag = Node.is(SyntaxKind.JSDocReadonlyTag);
  /** Gets if the node is a JSDocReturnTag. */
  static readonly isJSDocReturnTag: (node: compiler.Node | undefined) => node is compiler.JSDocReturnTag = Node.is(SyntaxKind.JSDocReturnTag);
  /** Gets if the node is a JSDocSatisfiesTag. */
  static readonly isJSDocSatisfiesTag: (node: compiler.Node | undefined) => node is compiler.JSDocSatisfiesTag = Node.is(SyntaxKind.JSDocSatisfiesTag);
  /** Gets if the node is a JSDocSeeTag. */
  static readonly isJSDocSeeTag: (node: compiler.Node | undefined) => node is compiler.JSDocSeeTag = Node.is(SyntaxKind.JSDocSeeTag);
  /** Gets if the node is a JSDocSignature. */
  static readonly isJSDocSignature: (node: compiler.Node | undefined) => node is compiler.JSDocSignature = Node.is(SyntaxKind.JSDocSignature);

  /** Gets if the node is a JSDocTag. */
  static isJSDocTag(node: compiler.Node | undefined): node is compiler.JSDocTag {
    switch (node?.getKind()) {
      case SyntaxKind.JSDocAugmentsTag:
      case SyntaxKind.JSDocAuthorTag:
      case SyntaxKind.JSDocCallbackTag:
      case SyntaxKind.JSDocClassTag:
      case SyntaxKind.JSDocDeprecatedTag:
      case SyntaxKind.JSDocEnumTag:
      case SyntaxKind.JSDocImplementsTag:
      case SyntaxKind.JSDocOverloadTag:
      case SyntaxKind.JSDocOverrideTag:
      case SyntaxKind.JSDocParameterTag:
      case SyntaxKind.JSDocPrivateTag:
      case SyntaxKind.JSDocPropertyTag:
      case SyntaxKind.JSDocProtectedTag:
      case SyntaxKind.JSDocPublicTag:
      case SyntaxKind.JSDocReadonlyTag:
      case SyntaxKind.JSDocReturnTag:
      case SyntaxKind.JSDocSatisfiesTag:
      case SyntaxKind.JSDocSeeTag:
      case SyntaxKind.JSDocTemplateTag:
      case SyntaxKind.JSDocThisTag:
      case SyntaxKind.JSDocThrowsTag:
      case SyntaxKind.JSDocTypedefTag:
      case SyntaxKind.JSDocTypeTag:
      case SyntaxKind.JSDocTag:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JSDocTemplateTag. */
  static readonly isJSDocTemplateTag: (node: compiler.Node | undefined) => node is compiler.JSDocTemplateTag = Node.is(SyntaxKind.JSDocTemplateTag);
  /** Gets if the node is a JSDocText. */
  static readonly isJSDocText: (node: compiler.Node | undefined) => node is compiler.JSDocText = Node.is(SyntaxKind.JSDocText);
  /** Gets if the node is a JSDocThisTag. */
  static readonly isJSDocThisTag: (node: compiler.Node | undefined) => node is compiler.JSDocThisTag = Node.is(SyntaxKind.JSDocThisTag);
  /** Gets if the node is a JSDocThrowsTag. */
  static readonly isJSDocThrowsTag: (node: compiler.Node | undefined) => node is compiler.JSDocThrowsTag = Node.is(SyntaxKind.JSDocThrowsTag);

  /** Gets if the node is a JSDocType. */
  static isJSDocType(node: compiler.Node | undefined): node is compiler.JSDocType {
    switch (node?.getKind()) {
      case SyntaxKind.JSDocAllType:
      case SyntaxKind.JSDocFunctionType:
      case SyntaxKind.JSDocNamepathType:
      case SyntaxKind.JSDocNonNullableType:
      case SyntaxKind.JSDocNullableType:
      case SyntaxKind.JSDocOptionalType:
      case SyntaxKind.JSDocSignature:
      case SyntaxKind.JSDocTypeLiteral:
      case SyntaxKind.JSDocUnknownType:
      case SyntaxKind.JSDocVariadicType:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JSDocTypedefTag. */
  static readonly isJSDocTypedefTag: (node: compiler.Node | undefined) => node is compiler.JSDocTypedefTag = Node.is(SyntaxKind.JSDocTypedefTag);
  /** Gets if the node is a JSDocTypeExpression. */
  static readonly isJSDocTypeExpression: (node: compiler.Node | undefined) => node is compiler.JSDocTypeExpression = Node.is(SyntaxKind.JSDocTypeExpression);

  /** Gets if the node is a JSDocTypeExpressionableTag. */
  static isJSDocTypeExpressionableTag<T extends compiler.Node>(node: T | undefined): node is compiler.JSDocTypeExpressionableTag & compiler.JSDocTypeExpressionableTagExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.JSDocOverloadTag:
      case SyntaxKind.JSDocReturnTag:
      case SyntaxKind.JSDocSatisfiesTag:
      case SyntaxKind.JSDocSeeTag:
      case SyntaxKind.JSDocThisTag:
      case SyntaxKind.JSDocThrowsTag:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JSDocTypeLiteral. */
  static readonly isJSDocTypeLiteral: (node: compiler.Node | undefined) => node is compiler.JSDocTypeLiteral = Node.is(SyntaxKind.JSDocTypeLiteral);

  /** Gets if the node is a JSDocTypeParameteredTag. */
  static isJSDocTypeParameteredTag<T extends compiler.Node>(node: T | undefined): node is compiler.JSDocTypeParameteredTag & compiler.JSDocTypeParameteredTagExtensionType & T {
    return node?.getKind() === SyntaxKind.JSDocTemplateTag;
  }

  /** Gets if the node is a JSDocTypeTag. */
  static readonly isJSDocTypeTag: (node: compiler.Node | undefined) => node is compiler.JSDocTypeTag = Node.is(SyntaxKind.JSDocTypeTag);

  /** Gets if the node is a JSDocUnknownTag. */
  static isJSDocUnknownTag(node: compiler.Node | undefined): node is compiler.JSDocUnknownTag {
    return node?.getKind() === SyntaxKind.JSDocTag;
  }

  /** Gets if the node is a JSDocUnknownType. */
  static readonly isJSDocUnknownType: (node: compiler.Node | undefined) => node is compiler.JSDocUnknownType = Node.is(SyntaxKind.JSDocUnknownType);
  /** Gets if the node is a JSDocVariadicType. */
  static readonly isJSDocVariadicType: (node: compiler.Node | undefined) => node is compiler.JSDocVariadicType = Node.is(SyntaxKind.JSDocVariadicType);
  /** Gets if the node is a JsxAttribute. */
  static readonly isJsxAttribute: (node: compiler.Node | undefined) => node is compiler.JsxAttribute = Node.is(SyntaxKind.JsxAttribute);

  /** Gets if the node is a JsxAttributedNode. */
  static isJsxAttributed<T extends compiler.Node>(node: T | undefined): node is compiler.JsxAttributedNode & compiler.JsxAttributedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.JsxOpeningElement:
      case SyntaxKind.JsxSelfClosingElement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JsxClosingElement. */
  static readonly isJsxClosingElement: (node: compiler.Node | undefined) => node is compiler.JsxClosingElement = Node.is(SyntaxKind.JsxClosingElement);
  /** Gets if the node is a JsxClosingFragment. */
  static readonly isJsxClosingFragment: (node: compiler.Node | undefined) => node is compiler.JsxClosingFragment = Node.is(SyntaxKind.JsxClosingFragment);
  /** Gets if the node is a JsxElement. */
  static readonly isJsxElement: (node: compiler.Node | undefined) => node is compiler.JsxElement = Node.is(SyntaxKind.JsxElement);
  /** Gets if the node is a JsxExpression. */
  static readonly isJsxExpression: (node: compiler.Node | undefined) => node is compiler.JsxExpression = Node.is(SyntaxKind.JsxExpression);
  /** Gets if the node is a JsxFragment. */
  static readonly isJsxFragment: (node: compiler.Node | undefined) => node is compiler.JsxFragment = Node.is(SyntaxKind.JsxFragment);
  /** Gets if the node is a JsxNamespacedName. */
  static readonly isJsxNamespacedName: (node: compiler.Node | undefined) => node is compiler.JsxNamespacedName = Node.is(SyntaxKind.JsxNamespacedName);
  /** Gets if the node is a JsxOpeningElement. */
  static readonly isJsxOpeningElement: (node: compiler.Node | undefined) => node is compiler.JsxOpeningElement = Node.is(SyntaxKind.JsxOpeningElement);
  /** Gets if the node is a JsxOpeningFragment. */
  static readonly isJsxOpeningFragment: (node: compiler.Node | undefined) => node is compiler.JsxOpeningFragment = Node.is(SyntaxKind.JsxOpeningFragment);
  /** Gets if the node is a JsxSelfClosingElement. */
  static readonly isJsxSelfClosingElement: (node: compiler.Node | undefined) => node is compiler.JsxSelfClosingElement = Node.is(SyntaxKind.JsxSelfClosingElement);
  /** Gets if the node is a JsxSpreadAttribute. */
  static readonly isJsxSpreadAttribute: (node: compiler.Node | undefined) => node is compiler.JsxSpreadAttribute = Node.is(SyntaxKind.JsxSpreadAttribute);

  /** Gets if the node is a JsxTagNamedNode. */
  static isJsxTagNamed<T extends compiler.Node>(node: T | undefined): node is compiler.JsxTagNamedNode & compiler.JsxTagNamedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.JsxClosingElement:
      case SyntaxKind.JsxOpeningElement:
      case SyntaxKind.JsxSelfClosingElement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a JsxText. */
  static readonly isJsxText: (node: compiler.Node | undefined) => node is compiler.JsxText = Node.is(SyntaxKind.JsxText);
  /** Gets if the node is a LabeledStatement. */
  static readonly isLabeledStatement: (node: compiler.Node | undefined) => node is compiler.LabeledStatement = Node.is(SyntaxKind.LabeledStatement);

  /** Gets if the node is a LeftHandSideExpression. */
  static isLeftHandSideExpression(node: compiler.Node | undefined): node is compiler.LeftHandSideExpression {
    switch (node?.getKind()) {
      case SyntaxKind.ArrayLiteralExpression:
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.CallExpression:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.ElementAccessExpression:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportKeyword:
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxFragment:
      case SyntaxKind.JsxSelfClosingElement:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.NewExpression:
      case SyntaxKind.NonNullExpression:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NullKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.ObjectLiteralExpression:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.SuperKeyword:
      case SyntaxKind.TaggedTemplateExpression:
      case SyntaxKind.TemplateExpression:
      case SyntaxKind.ThisKeyword:
      case SyntaxKind.TrueKeyword:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a LeftHandSideExpressionedNode. */
  static isLeftHandSideExpressioned<T extends compiler.Node>(node: T | undefined): node is compiler.LeftHandSideExpressionedNode & compiler.LeftHandSideExpressionedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.CallExpression:
      case SyntaxKind.Decorator:
      case SyntaxKind.ElementAccessExpression:
      case SyntaxKind.ExpressionWithTypeArguments:
      case SyntaxKind.NewExpression:
      case SyntaxKind.PropertyAccessExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a LiteralExpression. */
  static isLiteralExpression(node: compiler.Node | undefined): node is compiler.LiteralExpression {
    switch (node?.getKind()) {
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.StringLiteral:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a LiteralLikeNode. */
  static isLiteralLike<T extends compiler.Node>(node: T | undefined): node is compiler.LiteralLikeNode & compiler.LiteralLikeNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.JsxText:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.TemplateHead:
      case SyntaxKind.TemplateMiddle:
      case SyntaxKind.TemplateTail:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a LiteralTypeNode. */
  static isLiteralTypeNode(node: compiler.Node | undefined): node is compiler.LiteralTypeNode {
    return node?.getKind() === SyntaxKind.LiteralType;
  }

  /** Gets if the node is a MappedTypeNode. */
  static isMappedTypeNode(node: compiler.Node | undefined): node is compiler.MappedTypeNode {
    return node?.getKind() === SyntaxKind.MappedType;
  }

  /** Gets if the node is a MemberExpression. */
  static isMemberExpression(node: compiler.Node | undefined): node is compiler.MemberExpression {
    switch (node?.getKind()) {
      case SyntaxKind.ArrayLiteralExpression:
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.ElementAccessExpression:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportKeyword:
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxFragment:
      case SyntaxKind.JsxSelfClosingElement:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.NewExpression:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NullKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.ObjectLiteralExpression:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.SuperKeyword:
      case SyntaxKind.TaggedTemplateExpression:
      case SyntaxKind.TemplateExpression:
      case SyntaxKind.ThisKeyword:
      case SyntaxKind.TrueKeyword:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a MetaProperty. */
  static readonly isMetaProperty: (node: compiler.Node | undefined) => node is compiler.MetaProperty = Node.is(SyntaxKind.MetaProperty);
  /** Gets if the node is a MethodDeclaration. */
  static readonly isMethodDeclaration: (node: compiler.Node | undefined) => node is compiler.MethodDeclaration = Node.is(SyntaxKind.MethodDeclaration);
  /** Gets if the node is a MethodSignature. */
  static readonly isMethodSignature: (node: compiler.Node | undefined) => node is compiler.MethodSignature = Node.is(SyntaxKind.MethodSignature);

  /** Gets if the node is a ModifierableNode. */
  static isModifierable<T extends compiler.Node>(node: T | undefined): node is compiler.ModifierableNode & compiler.ModifierableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructorType:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.IndexSignature:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.TypeParameter:
      case SyntaxKind.VariableDeclarationList:
      case SyntaxKind.VariableStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ModuleBlock. */
  static readonly isModuleBlock: (node: compiler.Node | undefined) => node is compiler.ModuleBlock = Node.is(SyntaxKind.ModuleBlock);

  /** Gets if the node is a ModuleChildableNode. */
  static isModuleChildable<T extends compiler.Node>(node: T | undefined): node is compiler.ModuleChildableNode & compiler.ModuleChildableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.VariableStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ModuleDeclaration. */
  static readonly isModuleDeclaration: (node: compiler.Node | undefined) => node is compiler.ModuleDeclaration = Node.is(SyntaxKind.ModuleDeclaration);

  /** Gets if the node is a ModuledNode. */
  static isModuled<T extends compiler.Node>(node: T | undefined): node is compiler.ModuledNode & compiler.ModuledNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.SourceFile:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ModuleNamedNode. */
  static isModuleNamed<T extends compiler.Node>(node: T | undefined): node is compiler.ModuleNamedNode & compiler.ModuleNamedNodeExtensionType & T {
    return node?.getKind() === SyntaxKind.ModuleDeclaration;
  }

  /** Gets if the node is a NameableNode. */
  static isNameable<T extends compiler.Node>(node: T | undefined): node is compiler.NameableNode & compiler.NameableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a NamedExports. */
  static readonly isNamedExports: (node: compiler.Node | undefined) => node is compiler.NamedExports = Node.is(SyntaxKind.NamedExports);
  /** Gets if the node is a NamedImports. */
  static readonly isNamedImports: (node: compiler.Node | undefined) => node is compiler.NamedImports = Node.is(SyntaxKind.NamedImports);

  /** Gets if the node is a NamedNode. */
  static isNamed<T extends compiler.Node>(node: T | undefined): node is compiler.NamedNode & compiler.NamedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.ShorthandPropertyAssignment:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.TypeParameter:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a NamedTupleMember. */
  static readonly isNamedTupleMember: (node: compiler.Node | undefined) => node is compiler.NamedTupleMember = Node.is(SyntaxKind.NamedTupleMember);
  /** Gets if the node is a NamespaceExport. */
  static readonly isNamespaceExport: (node: compiler.Node | undefined) => node is compiler.NamespaceExport = Node.is(SyntaxKind.NamespaceExport);
  /** Gets if the node is a NamespaceImport. */
  static readonly isNamespaceImport: (node: compiler.Node | undefined) => node is compiler.NamespaceImport = Node.is(SyntaxKind.NamespaceImport);
  /** Gets if the node is a NeverKeyword. */
  static readonly isNeverKeyword: (node: compiler.Node | undefined) => node is compiler.Node<ts.Token<SyntaxKind.NeverKeyword>> = Node.is(SyntaxKind.NeverKeyword);
  /** Gets if the node is a NewExpression. */
  static readonly isNewExpression: (node: compiler.Node | undefined) => node is compiler.NewExpression = Node.is(SyntaxKind.NewExpression);

  /** Gets if the node is a NodeWithTypeArguments. */
  static isNodeWithTypeArguments(node: compiler.Node | undefined): node is compiler.NodeWithTypeArguments {
    switch (node?.getKind()) {
      case SyntaxKind.ExpressionWithTypeArguments:
      case SyntaxKind.ImportType:
      case SyntaxKind.TypeQuery:
      case SyntaxKind.TypeReference:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a NonNullExpression. */
  static readonly isNonNullExpression: (node: compiler.Node | undefined) => node is compiler.NonNullExpression = Node.is(SyntaxKind.NonNullExpression);
  /** Gets if the node is a NoSubstitutionTemplateLiteral. */
  static readonly isNoSubstitutionTemplateLiteral: (node: compiler.Node | undefined) => node is compiler.NoSubstitutionTemplateLiteral = Node.is(SyntaxKind.NoSubstitutionTemplateLiteral);
  /** Gets if the node is a NotEmittedStatement. */
  static readonly isNotEmittedStatement: (node: compiler.Node | undefined) => node is compiler.NotEmittedStatement = Node.is(SyntaxKind.NotEmittedStatement);

  /** Gets if the node is a NullLiteral. */
  static isNullLiteral(node: compiler.Node | undefined): node is compiler.NullLiteral {
    return node?.getKind() === SyntaxKind.NullKeyword;
  }

  /** Gets if the node is a NumberKeyword. */
  static readonly isNumberKeyword: (node: compiler.Node | undefined) => node is compiler.Expression = Node.is(SyntaxKind.NumberKeyword);
  /** Gets if the node is a NumericLiteral. */
  static readonly isNumericLiteral: (node: compiler.Node | undefined) => node is compiler.NumericLiteral = Node.is(SyntaxKind.NumericLiteral);
  /** Gets if the node is a ObjectBindingPattern. */
  static readonly isObjectBindingPattern: (node: compiler.Node | undefined) => node is compiler.ObjectBindingPattern = Node.is(SyntaxKind.ObjectBindingPattern);
  /** Gets if the node is a ObjectKeyword. */
  static readonly isObjectKeyword: (node: compiler.Node | undefined) => node is compiler.Expression = Node.is(SyntaxKind.ObjectKeyword);
  /** Gets if the node is a ObjectLiteralExpression. */
  static readonly isObjectLiteralExpression: (node: compiler.Node | undefined) => node is compiler.ObjectLiteralExpression = Node.is(SyntaxKind.ObjectLiteralExpression);
  /** Gets if the node is a OmittedExpression. */
  static readonly isOmittedExpression: (node: compiler.Node | undefined) => node is compiler.OmittedExpression = Node.is(SyntaxKind.OmittedExpression);

  /** Gets if the node is a OverloadableNode. */
  static isOverloadable<T extends compiler.Node>(node: T | undefined): node is compiler.OverloadableNode & compiler.OverloadableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.Constructor:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.MethodDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a OverrideableNode. */
  static isOverrideable<T extends compiler.Node>(node: T | undefined): node is compiler.OverrideableNode & compiler.OverrideableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ParameterDeclaration. */
  static isParameterDeclaration(node: compiler.Node | undefined): node is compiler.ParameterDeclaration {
    return node?.getKind() === SyntaxKind.Parameter;
  }

  /** Gets if the node is a ParameteredNode. */
  static isParametered<T extends compiler.Node>(node: T | undefined): node is compiler.ParameteredNode & compiler.ParameteredNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.CallSignature:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructorType:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.FunctionType:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.JSDocFunctionType:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ParenthesizedExpression. */
  static readonly isParenthesizedExpression: (node: compiler.Node | undefined) => node is compiler.ParenthesizedExpression = Node.is(SyntaxKind.ParenthesizedExpression);

  /** Gets if the node is a ParenthesizedTypeNode. */
  static isParenthesizedTypeNode(node: compiler.Node | undefined): node is compiler.ParenthesizedTypeNode {
    return node?.getKind() === SyntaxKind.ParenthesizedType;
  }

  /** Gets if the node is a PartiallyEmittedExpression. */
  static readonly isPartiallyEmittedExpression: (node: compiler.Node | undefined) => node is compiler.PartiallyEmittedExpression = Node.is(SyntaxKind.PartiallyEmittedExpression);
  /** Gets if the node is a PostfixUnaryExpression. */
  static readonly isPostfixUnaryExpression: (node: compiler.Node | undefined) => node is compiler.PostfixUnaryExpression = Node.is(SyntaxKind.PostfixUnaryExpression);
  /** Gets if the node is a PrefixUnaryExpression. */
  static readonly isPrefixUnaryExpression: (node: compiler.Node | undefined) => node is compiler.PrefixUnaryExpression = Node.is(SyntaxKind.PrefixUnaryExpression);

  /** Gets if the node is a PrimaryExpression. */
  static isPrimaryExpression(node: compiler.Node | undefined): node is compiler.PrimaryExpression {
    switch (node?.getKind()) {
      case SyntaxKind.ArrayLiteralExpression:
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportKeyword:
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxFragment:
      case SyntaxKind.JsxSelfClosingElement:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.NewExpression:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NullKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.ObjectLiteralExpression:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.SuperKeyword:
      case SyntaxKind.TemplateExpression:
      case SyntaxKind.ThisKeyword:
      case SyntaxKind.TrueKeyword:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a PrivateIdentifier. */
  static readonly isPrivateIdentifier: (node: compiler.Node | undefined) => node is compiler.PrivateIdentifier = Node.is(SyntaxKind.PrivateIdentifier);
  /** Gets if the node is a PropertyAccessExpression. */
  static readonly isPropertyAccessExpression: (node: compiler.Node | undefined) => node is compiler.PropertyAccessExpression = Node.is(SyntaxKind.PropertyAccessExpression);
  /** Gets if the node is a PropertyAssignment. */
  static readonly isPropertyAssignment: (node: compiler.Node | undefined) => node is compiler.PropertyAssignment = Node.is(SyntaxKind.PropertyAssignment);
  /** Gets if the node is a PropertyDeclaration. */
  static readonly isPropertyDeclaration: (node: compiler.Node | undefined) => node is compiler.PropertyDeclaration = Node.is(SyntaxKind.PropertyDeclaration);

  /** Gets if the node is a PropertyNamedNode. */
  static isPropertyNamed<T extends compiler.Node>(node: T | undefined): node is compiler.PropertyNamedNode & compiler.PropertyNamedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.EnumMember:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.PropertyAssignment:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a PropertySignature. */
  static readonly isPropertySignature: (node: compiler.Node | undefined) => node is compiler.PropertySignature = Node.is(SyntaxKind.PropertySignature);
  /** Gets if the node is a QualifiedName. */
  static readonly isQualifiedName: (node: compiler.Node | undefined) => node is compiler.QualifiedName = Node.is(SyntaxKind.QualifiedName);

  /** Gets if the node is a QuestionDotTokenableNode. */
  static isQuestionDotTokenable<T extends compiler.Node>(node: T | undefined): node is compiler.QuestionDotTokenableNode & compiler.QuestionDotTokenableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.CallExpression:
      case SyntaxKind.ElementAccessExpression:
      case SyntaxKind.PropertyAccessExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a QuestionTokenableNode. */
  static isQuestionTokenable<T extends compiler.Node>(node: T | undefined): node is compiler.QuestionTokenableNode & compiler.QuestionTokenableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyAssignment:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.ShorthandPropertyAssignment:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ReadonlyableNode. */
  static isReadonlyable<T extends compiler.Node>(node: T | undefined): node is compiler.ReadonlyableNode & compiler.ReadonlyableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.IndexSignature:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ReferenceFindableNode. */
  static isReferenceFindable<T extends compiler.Node>(node: T | undefined): node is compiler.ReferenceFindableNode & compiler.ReferenceFindableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.BindingElement:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.Constructor:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.EnumMember:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportAttribute:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.Parameter:
      case SyntaxKind.PrivateIdentifier:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.PropertyAssignment:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.ShorthandPropertyAssignment:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.TypeParameter:
      case SyntaxKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a RegularExpressionLiteral. */
  static readonly isRegularExpressionLiteral: (node: compiler.Node | undefined) => node is compiler.RegularExpressionLiteral = Node.is(SyntaxKind.RegularExpressionLiteral);

  /** Gets if the node is a RenameableNode. */
  static isRenameable<T extends compiler.Node>(node: T | undefined): node is compiler.RenameableNode & compiler.RenameableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.BindingElement:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.EnumMember:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportAttribute:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.NamespaceExport:
      case SyntaxKind.NamespaceImport:
      case SyntaxKind.Parameter:
      case SyntaxKind.PrivateIdentifier:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.PropertyAssignment:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.ShorthandPropertyAssignment:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.TypeParameter:
      case SyntaxKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a RestTypeNode. */
  static isRestTypeNode(node: compiler.Node | undefined): node is compiler.RestTypeNode {
    return node?.getKind() === SyntaxKind.RestType;
  }

  /** Gets if the node is a ReturnStatement. */
  static readonly isReturnStatement: (node: compiler.Node | undefined) => node is compiler.ReturnStatement = Node.is(SyntaxKind.ReturnStatement);

  /** Gets if the node is a ReturnTypedNode. */
  static isReturnTyped<T extends compiler.Node>(node: T | undefined): node is compiler.ReturnTypedNode & compiler.ReturnTypedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.CallSignature:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructorType:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.FunctionType:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.IndexSignature:
      case SyntaxKind.JSDocFunctionType:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a SatisfiesExpression. */
  static readonly isSatisfiesExpression: (node: compiler.Node | undefined) => node is compiler.SatisfiesExpression = Node.is(SyntaxKind.SatisfiesExpression);

  /** Gets if the node is a ScopeableNode. */
  static isScopeable<T extends compiler.Node>(node: T | undefined): node is compiler.ScopeableNode & compiler.ScopeableNodeExtensionType & T {
    return node?.getKind() === SyntaxKind.Parameter;
  }

  /** Gets if the node is a ScopedNode. */
  static isScoped<T extends compiler.Node>(node: T | undefined): node is compiler.ScopedNode & compiler.ScopedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.Constructor:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a SemicolonToken. */
  static readonly isSemicolonToken: (node: compiler.Node | undefined) => node is compiler.Node<ts.Token<SyntaxKind.SemicolonToken>> = Node.is(SyntaxKind.SemicolonToken);

  /** Gets if the node is a SetAccessorDeclaration. */
  static isSetAccessorDeclaration(node: compiler.Node | undefined): node is compiler.SetAccessorDeclaration {
    return node?.getKind() === SyntaxKind.SetAccessor;
  }

  /** Gets if the node is a ShorthandPropertyAssignment. */
  static readonly isShorthandPropertyAssignment: (node: compiler.Node | undefined) => node is compiler.ShorthandPropertyAssignment = Node.is(SyntaxKind.ShorthandPropertyAssignment);

  /** Gets if the node is a SignaturedDeclaration. */
  static isSignaturedDeclaration<T extends compiler.Node>(node: T | undefined): node is compiler.SignaturedDeclaration & compiler.SignaturedDeclarationExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.CallSignature:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructorType:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.FunctionType:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.JSDocFunctionType:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a SourceFile. */
  static readonly isSourceFile: (node: compiler.Node | undefined) => node is compiler.SourceFile = Node.is(SyntaxKind.SourceFile);
  /** Gets if the node is a SpreadAssignment. */
  static readonly isSpreadAssignment: (node: compiler.Node | undefined) => node is compiler.SpreadAssignment = Node.is(SyntaxKind.SpreadAssignment);
  /** Gets if the node is a SpreadElement. */
  static readonly isSpreadElement: (node: compiler.Node | undefined) => node is compiler.SpreadElement = Node.is(SyntaxKind.SpreadElement);

  /** Gets if the node is a Statement. */
  static isStatement(node: compiler.Node | undefined): node is compiler.Statement {
    switch (node?.getKind()) {
      case SyntaxKind.Block:
      case SyntaxKind.BreakStatement:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ContinueStatement:
      case SyntaxKind.DebuggerStatement:
      case SyntaxKind.DoStatement:
      case SyntaxKind.EmptyStatement:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.ExportAssignment:
      case SyntaxKind.ExportDeclaration:
      case SyntaxKind.ExpressionStatement:
      case SyntaxKind.ForInStatement:
      case SyntaxKind.ForOfStatement:
      case SyntaxKind.ForStatement:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.IfStatement:
      case SyntaxKind.ImportDeclaration:
      case SyntaxKind.ImportEqualsDeclaration:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.LabeledStatement:
      case SyntaxKind.ModuleBlock:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.NotEmittedStatement:
      case SyntaxKind.ReturnStatement:
      case SyntaxKind.SwitchStatement:
      case SyntaxKind.ThrowStatement:
      case SyntaxKind.TryStatement:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.VariableStatement:
      case SyntaxKind.WhileStatement:
      case SyntaxKind.WithStatement:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a StatementedNode. */
  static isStatemented<T extends compiler.Node>(node: T | undefined): node is compiler.StatementedNode & compiler.StatementedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.Block:
      case SyntaxKind.CaseClause:
      case SyntaxKind.ClassStaticBlockDeclaration:
      case SyntaxKind.Constructor:
      case SyntaxKind.DefaultClause:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.ModuleBlock:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.SourceFile:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a StaticableNode. */
  static isStaticable<T extends compiler.Node>(node: T | undefined): node is compiler.StaticableNode & compiler.StaticableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.GetAccessor:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.SetAccessor:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a StringKeyword. */
  static readonly isStringKeyword: (node: compiler.Node | undefined) => node is compiler.Expression = Node.is(SyntaxKind.StringKeyword);
  /** Gets if the node is a StringLiteral. */
  static readonly isStringLiteral: (node: compiler.Node | undefined) => node is compiler.StringLiteral = Node.is(SyntaxKind.StringLiteral);

  /** Gets if the node is a SuperExpression. */
  static isSuperExpression(node: compiler.Node | undefined): node is compiler.SuperExpression {
    return node?.getKind() === SyntaxKind.SuperKeyword;
  }

  /** Gets if the node is a SwitchStatement. */
  static readonly isSwitchStatement: (node: compiler.Node | undefined) => node is compiler.SwitchStatement = Node.is(SyntaxKind.SwitchStatement);
  /** Gets if the node is a SymbolKeyword. */
  static readonly isSymbolKeyword: (node: compiler.Node | undefined) => node is compiler.Expression = Node.is(SyntaxKind.SymbolKeyword);
  /** Gets if the node is a SyntaxList. */
  static readonly isSyntaxList: (node: compiler.Node | undefined) => node is compiler.SyntaxList = Node.is(SyntaxKind.SyntaxList);
  /** Gets if the node is a TaggedTemplateExpression. */
  static readonly isTaggedTemplateExpression: (node: compiler.Node | undefined) => node is compiler.TaggedTemplateExpression = Node.is(SyntaxKind.TaggedTemplateExpression);
  /** Gets if the node is a TemplateExpression. */
  static readonly isTemplateExpression: (node: compiler.Node | undefined) => node is compiler.TemplateExpression = Node.is(SyntaxKind.TemplateExpression);
  /** Gets if the node is a TemplateHead. */
  static readonly isTemplateHead: (node: compiler.Node | undefined) => node is compiler.TemplateHead = Node.is(SyntaxKind.TemplateHead);

  /** Gets if the node is a TemplateLiteralTypeNode. */
  static isTemplateLiteralTypeNode(node: compiler.Node | undefined): node is compiler.TemplateLiteralTypeNode {
    return node?.getKind() === SyntaxKind.TemplateLiteralType;
  }

  /** Gets if the node is a TemplateMiddle. */
  static readonly isTemplateMiddle: (node: compiler.Node | undefined) => node is compiler.TemplateMiddle = Node.is(SyntaxKind.TemplateMiddle);
  /** Gets if the node is a TemplateSpan. */
  static readonly isTemplateSpan: (node: compiler.Node | undefined) => node is compiler.TemplateSpan = Node.is(SyntaxKind.TemplateSpan);
  /** Gets if the node is a TemplateTail. */
  static readonly isTemplateTail: (node: compiler.Node | undefined) => node is compiler.TemplateTail = Node.is(SyntaxKind.TemplateTail);

  /** Gets if the node is a TextInsertableNode. */
  static isTextInsertable<T extends compiler.Node>(node: T | undefined): node is compiler.TextInsertableNode & compiler.TextInsertableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.Block:
      case SyntaxKind.CaseBlock:
      case SyntaxKind.CaseClause:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.ClassStaticBlockDeclaration:
      case SyntaxKind.Constructor:
      case SyntaxKind.DefaultClause:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.SourceFile:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a ThisExpression. */
  static isThisExpression(node: compiler.Node | undefined): node is compiler.ThisExpression {
    return node?.getKind() === SyntaxKind.ThisKeyword;
  }

  /** Gets if the node is a ThisTypeNode. */
  static isThisTypeNode(node: compiler.Node | undefined): node is compiler.ThisTypeNode {
    return node?.getKind() === SyntaxKind.ThisType;
  }

  /** Gets if the node is a ThrowStatement. */
  static readonly isThrowStatement: (node: compiler.Node | undefined) => node is compiler.ThrowStatement = Node.is(SyntaxKind.ThrowStatement);

  /** Gets if the node is a TrueLiteral. */
  static isTrueLiteral(node: compiler.Node | undefined): node is compiler.TrueLiteral {
    return node?.getKind() === SyntaxKind.TrueKeyword;
  }

  /** Gets if the node is a TryStatement. */
  static readonly isTryStatement: (node: compiler.Node | undefined) => node is compiler.TryStatement = Node.is(SyntaxKind.TryStatement);

  /** Gets if the node is a TupleTypeNode. */
  static isTupleTypeNode(node: compiler.Node | undefined): node is compiler.TupleTypeNode {
    return node?.getKind() === SyntaxKind.TupleType;
  }

  /** Gets if the node is a TypeAliasDeclaration. */
  static readonly isTypeAliasDeclaration: (node: compiler.Node | undefined) => node is compiler.TypeAliasDeclaration = Node.is(SyntaxKind.TypeAliasDeclaration);

  /** Gets if the node is a TypeArgumentedNode. */
  static isTypeArgumented<T extends compiler.Node>(node: T | undefined): node is compiler.TypeArgumentedNode & compiler.TypeArgumentedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.CallExpression:
      case SyntaxKind.ExpressionWithTypeArguments:
      case SyntaxKind.ImportType:
      case SyntaxKind.NewExpression:
      case SyntaxKind.TypeQuery:
      case SyntaxKind.TypeReference:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a TypeAssertion. */
  static isTypeAssertion(node: compiler.Node | undefined): node is compiler.TypeAssertion {
    return node?.getKind() === SyntaxKind.TypeAssertionExpression;
  }

  /** Gets if the node is a TypedNode. */
  static isTyped<T extends compiler.Node>(node: T | undefined): node is compiler.TypedNode & compiler.TypedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.AsExpression:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.SatisfiesExpression:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.TypeAssertionExpression:
      case SyntaxKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a TypeElement. */
  static isTypeElement(node: compiler.Node | undefined): node is compiler.TypeElement {
    switch (node?.getKind()) {
      case SyntaxKind.CallSignature:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.IndexSignature:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.PropertySignature:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a TypeElementMemberedNode. */
  static isTypeElementMembered<T extends compiler.Node>(node: T | undefined): node is compiler.TypeElementMemberedNode & compiler.TypeElementMemberedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.TypeLiteral:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a TypeLiteralNode. */
  static isTypeLiteral(node: compiler.Node | undefined): node is compiler.TypeLiteralNode {
    return node?.getKind() === SyntaxKind.TypeLiteral;
  }

  /** Gets if the node is a TypeNode. */
  static isTypeNode(node: compiler.Node | undefined): node is compiler.TypeNode {
    switch (node?.getKind()) {
      case SyntaxKind.ArrayType:
      case SyntaxKind.ConditionalType:
      case SyntaxKind.ConstructorType:
      case SyntaxKind.ExpressionWithTypeArguments:
      case SyntaxKind.FunctionType:
      case SyntaxKind.ImportType:
      case SyntaxKind.IndexedAccessType:
      case SyntaxKind.InferType:
      case SyntaxKind.IntersectionType:
      case SyntaxKind.JSDocAllType:
      case SyntaxKind.JSDocFunctionType:
      case SyntaxKind.JSDocNamepathType:
      case SyntaxKind.JSDocNonNullableType:
      case SyntaxKind.JSDocNullableType:
      case SyntaxKind.JSDocOptionalType:
      case SyntaxKind.JSDocSignature:
      case SyntaxKind.JSDocTypeExpression:
      case SyntaxKind.JSDocTypeLiteral:
      case SyntaxKind.JSDocUnknownType:
      case SyntaxKind.JSDocVariadicType:
      case SyntaxKind.LiteralType:
      case SyntaxKind.MappedType:
      case SyntaxKind.NamedTupleMember:
      case SyntaxKind.ParenthesizedType:
      case SyntaxKind.RestType:
      case SyntaxKind.TemplateLiteralType:
      case SyntaxKind.ThisType:
      case SyntaxKind.TupleType:
      case SyntaxKind.TypeLiteral:
      case SyntaxKind.TypeOperator:
      case SyntaxKind.TypePredicate:
      case SyntaxKind.TypeQuery:
      case SyntaxKind.TypeReference:
      case SyntaxKind.UnionType:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a TypeOfExpression. */
  static readonly isTypeOfExpression: (node: compiler.Node | undefined) => node is compiler.TypeOfExpression = Node.is(SyntaxKind.TypeOfExpression);

  /** Gets if the node is a TypeOperatorTypeNode. */
  static isTypeOperatorTypeNode(node: compiler.Node | undefined): node is compiler.TypeOperatorTypeNode {
    return node?.getKind() === SyntaxKind.TypeOperator;
  }

  /** Gets if the node is a TypeParameterDeclaration. */
  static isTypeParameterDeclaration(node: compiler.Node | undefined): node is compiler.TypeParameterDeclaration {
    return node?.getKind() === SyntaxKind.TypeParameter;
  }

  /** Gets if the node is a TypeParameteredNode. */
  static isTypeParametered<T extends compiler.Node>(node: T | undefined): node is compiler.TypeParameteredNode & compiler.TypeParameteredNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.ArrowFunction:
      case SyntaxKind.CallSignature:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.FunctionType:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.TypeAliasDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a TypePredicateNode. */
  static isTypePredicate(node: compiler.Node | undefined): node is compiler.TypePredicateNode {
    return node?.getKind() === SyntaxKind.TypePredicate;
  }

  /** Gets if the node is a TypeQueryNode. */
  static isTypeQuery(node: compiler.Node | undefined): node is compiler.TypeQueryNode {
    return node?.getKind() === SyntaxKind.TypeQuery;
  }

  /** Gets if the node is a TypeReferenceNode. */
  static isTypeReference(node: compiler.Node | undefined): node is compiler.TypeReferenceNode {
    return node?.getKind() === SyntaxKind.TypeReference;
  }

  /** Gets if the node is a UnaryExpression. */
  static isUnaryExpression(node: compiler.Node | undefined): node is compiler.UnaryExpression {
    switch (node?.getKind()) {
      case SyntaxKind.ArrayLiteralExpression:
      case SyntaxKind.AwaitExpression:
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.CallExpression:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.DeleteExpression:
      case SyntaxKind.ElementAccessExpression:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportKeyword:
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxFragment:
      case SyntaxKind.JsxSelfClosingElement:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.NewExpression:
      case SyntaxKind.NonNullExpression:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NullKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.ObjectLiteralExpression:
      case SyntaxKind.PostfixUnaryExpression:
      case SyntaxKind.PrefixUnaryExpression:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.SuperKeyword:
      case SyntaxKind.TaggedTemplateExpression:
      case SyntaxKind.TemplateExpression:
      case SyntaxKind.ThisKeyword:
      case SyntaxKind.TrueKeyword:
      case SyntaxKind.TypeAssertionExpression:
      case SyntaxKind.TypeOfExpression:
      case SyntaxKind.VoidExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a UnaryExpressionedNode. */
  static isUnaryExpressioned<T extends compiler.Node>(node: T | undefined): node is compiler.UnaryExpressionedNode & compiler.UnaryExpressionedNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.AwaitExpression:
      case SyntaxKind.DeleteExpression:
      case SyntaxKind.TypeAssertionExpression:
      case SyntaxKind.TypeOfExpression:
      case SyntaxKind.VoidExpression:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a UndefinedKeyword. */
  static readonly isUndefinedKeyword: (node: compiler.Node | undefined) => node is compiler.Expression = Node.is(SyntaxKind.UndefinedKeyword);

  /** Gets if the node is a UnionTypeNode. */
  static isUnionTypeNode(node: compiler.Node | undefined): node is compiler.UnionTypeNode {
    return node?.getKind() === SyntaxKind.UnionType;
  }

  /** Gets if the node is a UnwrappableNode. */
  static isUnwrappable<T extends compiler.Node>(node: T | undefined): node is compiler.UnwrappableNode & compiler.UnwrappableNodeExtensionType & T {
    switch (node?.getKind()) {
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.ModuleDeclaration:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a UpdateExpression. */
  static isUpdateExpression(node: compiler.Node | undefined): node is compiler.UpdateExpression {
    switch (node?.getKind()) {
      case SyntaxKind.ArrayLiteralExpression:
      case SyntaxKind.BigIntLiteral:
      case SyntaxKind.CallExpression:
      case SyntaxKind.ClassExpression:
      case SyntaxKind.ElementAccessExpression:
      case SyntaxKind.FalseKeyword:
      case SyntaxKind.FunctionExpression:
      case SyntaxKind.Identifier:
      case SyntaxKind.ImportKeyword:
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxFragment:
      case SyntaxKind.JsxSelfClosingElement:
      case SyntaxKind.MetaProperty:
      case SyntaxKind.NewExpression:
      case SyntaxKind.NonNullExpression:
      case SyntaxKind.NoSubstitutionTemplateLiteral:
      case SyntaxKind.NullKeyword:
      case SyntaxKind.NumericLiteral:
      case SyntaxKind.ObjectLiteralExpression:
      case SyntaxKind.PropertyAccessExpression:
      case SyntaxKind.RegularExpressionLiteral:
      case SyntaxKind.StringLiteral:
      case SyntaxKind.SuperKeyword:
      case SyntaxKind.TaggedTemplateExpression:
      case SyntaxKind.TemplateExpression:
      case SyntaxKind.ThisKeyword:
      case SyntaxKind.TrueKeyword:
        return true;
      default:
        return false;
    }
  }

  /** Gets if the node is a VariableDeclaration. */
  static readonly isVariableDeclaration: (node: compiler.Node | undefined) => node is compiler.VariableDeclaration = Node.is(SyntaxKind.VariableDeclaration);
  /** Gets if the node is a VariableDeclarationList. */
  static readonly isVariableDeclarationList: (node: compiler.Node | undefined) => node is compiler.VariableDeclarationList = Node.is(SyntaxKind.VariableDeclarationList);
  /** Gets if the node is a VariableStatement. */
  static readonly isVariableStatement: (node: compiler.Node | undefined) => node is compiler.VariableStatement = Node.is(SyntaxKind.VariableStatement);
  /** Gets if the node is a VoidExpression. */
  static readonly isVoidExpression: (node: compiler.Node | undefined) => node is compiler.VoidExpression = Node.is(SyntaxKind.VoidExpression);
  /** Gets if the node is a WhileStatement. */
  static readonly isWhileStatement: (node: compiler.Node | undefined) => node is compiler.WhileStatement = Node.is(SyntaxKind.WhileStatement);
  /** Gets if the node is a WithStatement. */
  static readonly isWithStatement: (node: compiler.Node | undefined) => node is compiler.WithStatement = Node.is(SyntaxKind.WithStatement);
  /** Gets if the node is a YieldExpression. */
  static readonly isYieldExpression: (node: compiler.Node | undefined) => node is compiler.YieldExpression = Node.is(SyntaxKind.YieldExpression);

  /** @internal */
  static _hasStructure(node: compiler.Node | undefined): node is compiler.Node & { getStructure(): Structure; } {
    switch (node?.getKind()) {
      case SyntaxKind.CallSignature:
      case SyntaxKind.ClassDeclaration:
      case SyntaxKind.ClassStaticBlockDeclaration:
      case SyntaxKind.Constructor:
      case SyntaxKind.ConstructSignature:
      case SyntaxKind.Decorator:
      case SyntaxKind.EnumDeclaration:
      case SyntaxKind.EnumMember:
      case SyntaxKind.ExportAssignment:
      case SyntaxKind.ExportDeclaration:
      case SyntaxKind.ExportSpecifier:
      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.GetAccessor:
      case SyntaxKind.ImportAttribute:
      case SyntaxKind.ImportDeclaration:
      case SyntaxKind.ImportSpecifier:
      case SyntaxKind.IndexSignature:
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.JSDoc:
      case SyntaxKind.JsxAttribute:
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxNamespacedName:
      case SyntaxKind.JsxSelfClosingElement:
      case SyntaxKind.JsxSpreadAttribute:
      case SyntaxKind.MethodDeclaration:
      case SyntaxKind.MethodSignature:
      case SyntaxKind.ModuleDeclaration:
      case SyntaxKind.Parameter:
      case SyntaxKind.PropertyAssignment:
      case SyntaxKind.PropertyDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.SetAccessor:
      case SyntaxKind.ShorthandPropertyAssignment:
      case SyntaxKind.SourceFile:
      case SyntaxKind.SpreadAssignment:
      case SyntaxKind.TypeAliasDeclaration:
      case SyntaxKind.TypeParameter:
      case SyntaxKind.VariableDeclaration:
      case SyntaxKind.VariableStatement:
        return true;
      default:
        return false;
    }
  }
}

function getWrappedCondition(thisNode: Node, condition: ((c: Node) => boolean) | undefined): ((c: ts.Node) => boolean) | undefined {
  return condition == null ? undefined : ((c: ts.Node) => condition(thisNode._getNodeFromCompilerNode(c)));
}

function insertWhiteSpaceTextAtPos(node: Node, insertPos: number, textOrWriterFunction: string | WriterFunction, methodName: string) {
  const parent = Node.isSourceFile(node) ? node.getChildSyntaxListOrThrow() : node.getParentSyntaxList() || node.getParentOrThrow();
  const newText = getTextFromStringOrWriter(node._getWriterWithQueuedIndentation(), textOrWriterFunction);

  if (!/^[\s\r\n]*$/.test(newText))
    throw new errors.InvalidOperationError(`Cannot insert non-whitespace into ${methodName}.`);

  insertIntoParentTextRange({
    parent,
    insertPos,
    newText,
  });
}

function* getCompilerForEachDescendantsIterator(node: ts.Node): IterableIterator<ts.Node> {
  for (const child of getForEachChildren()) {
    yield child;
    yield* getCompilerForEachDescendantsIterator(child);
  }

  function getForEachChildren() {
    const children: ts.Node[] = [];
    node.forEachChild(child => {
      children.push(child);
    });
    return children;
  }
}

function* getCompilerDescendantsIterator(node: ts.Node, sourceFile: ts.SourceFile): IterableIterator<ts.Node> {
  for (const child of ExtendedParser.getCompilerChildren(node, sourceFile)) {
    yield child;
    yield* getCompilerDescendantsIterator(child, sourceFile);
  }
}

/**
 * Tells the calling code if it's safe to search for the specified kind
 * using only the ast (`node.forEachChild(...)`... much faster) instead
 * of having to parse all the tokens via `node.getChildren()`.
 */
function useParseTreeSearchForKind(thisNodeOrSyntaxKind: Node | SyntaxKind, searchingKind: SyntaxKind) {
  return searchingKind >= SyntaxKind.FirstNode && searchingKind < SyntaxKind.FirstJSDocNode
    && getThisKind() !== SyntaxKind.SyntaxList;

  function getThisKind() {
    if (typeof thisNodeOrSyntaxKind === "number")
      return thisNodeOrSyntaxKind;
    return thisNodeOrSyntaxKind.compilerNode.kind;
  }
}
