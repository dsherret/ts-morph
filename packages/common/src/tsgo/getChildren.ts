/**
 * `getChildren()` for the tsgo AST.
 *
 * The new AST exposes `forEachChild`, which visits only the nodes stored in the
 * tree — it skips punctuation/keyword tokens and does not surface the
 * `SyntaxList` nodes ts-morph's wrappers expose. Classic TypeScript rebuilds
 * both in its services layer by scanning the gaps between stored children, and
 * this does the same.
 *
 * Results are cached per node. That is not only an optimization: ts-morph keys
 * its wrapper cache on compiler-node identity, so the tokens and syntax lists
 * synthesized here must be the *same objects* on every call.
 */
import { createToken } from "../../../../submodules/typescript-go/_packages/native-preview/src/ast/factory.generated.ts";
import { type Node, type NodeArray, type SourceFile, SyntaxKind } from "../../../../submodules/typescript-go/_packages/native-preview/src/ast/index.ts";
import { createScanner, type Scanner } from "../../../../submodules/typescript-go/_packages/native-preview/src/ast/scanner.ts";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** Per-source-file scanner and token cache, keyed by node span. */
interface FileCache {
  scanner: Scanner;
  tokens: Map<string, Node>;
}

const fileCaches = new WeakMap<SourceFile, FileCache>();
const childrenCache = new WeakMap<Node, Node[]>();

/**
 * Returns every child of `node` in source order, including tokens and
 * `SyntaxList` nodes, mirroring classic TypeScript's `Node#getChildren()`.
 */
export function getChildren(node: Node, sourceFile: SourceFile = node.getSourceFile()): Node[] {
  const cached = childrenCache.get(node);
  if (cached !== undefined)
    return cached;

  // Tokens and identifiers have no children in the classic services layer.
  if (node.kind <= SyntaxKind.LastToken) {
    const empty: Node[] = [];
    childrenCache.set(node, empty);
    return empty;
  }

  const cache = getFileCache(sourceFile);
  const children: Node[] = [];
  let pos = node.pos;

  node.forEachChild(
    child => {
      addSyntheticTokens(children, cache, pos, child.pos, node);
      children.push(child);
      pos = child.end;
      return undefined;
    },
    nodes => {
      addSyntheticTokens(children, cache, pos, nodes.pos, node);
      children.push(createSyntaxList(nodes, node, cache));
      pos = nodes.end;
      return undefined;
    },
  );
  addSyntheticTokens(children, cache, pos, node.end, node);

  childrenCache.set(node, children);
  return children;
}

/** Returns the last child token of `node`, or `undefined` when it has none. */
export function getLastToken(node: Node, sourceFile: SourceFile = node.getSourceFile()): Node | undefined {
  const children = getChildren(node, sourceFile);
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child.pos === child.end)
      continue;
    return child.kind <= SyntaxKind.LastToken ? child : getLastToken(child, sourceFile);
  }
  return undefined;
}

/** Builds the `SyntaxList` node that stands in for a stored node array. */
function createSyntaxList(nodes: NodeArray<Node>, parent: Node, cache: FileCache): Node {
  const list = createToken(SyntaxKind.SyntaxList as never) as unknown as Mutable<Node>;
  list.pos = nodes.pos;
  list.end = nodes.end;
  list.parent = parent;
  const listNode = list as unknown as Node;

  const children: Node[] = [];
  let pos = nodes.pos;
  for (const node of nodes) {
    addSyntheticTokens(children, cache, pos, node.pos, listNode);
    children.push(node);
    pos = node.end;
  }
  addSyntheticTokens(children, cache, pos, nodes.end, listNode);

  // Cache directly so getChildren(list) returns these without rescanning; a
  // syntax list is synthetic and has no forEachChild of its own.
  childrenCache.set(listNode, children);
  return listNode;
}

/** Scans `[pos, end)` and appends every token found to `children`. */
function addSyntheticTokens(children: Node[], cache: FileCache, pos: number, end: number, parent: Node): void {
  const { scanner } = cache;
  scanner.resetTokenState(pos);
  while (pos < end) {
    const kind = scanner.scan();
    const tokenEnd = scanner.getTokenEnd();
    if (tokenEnd <= end)
      children.push(getOrCreateToken(cache, kind, pos, tokenEnd, parent));
    pos = tokenEnd;
    if (kind === SyntaxKind.EndOfFile)
      break;
  }
}

/** Returns the cached token for a span, creating it on first use. */
function getOrCreateToken(cache: FileCache, kind: SyntaxKind, pos: number, end: number, parent: Node): Node {
  const key = `${pos}_${end}`;
  const existing = cache.tokens.get(key);
  if (existing !== undefined)
    return existing;

  const token = createToken(kind as never) as unknown as Mutable<Node>;
  token.pos = pos;
  token.end = end;
  token.parent = parent;
  const node = token as unknown as Node;
  cache.tokens.set(key, node);
  return node;
}

function getFileCache(sourceFile: SourceFile): FileCache {
  let cache = fileCaches.get(sourceFile);
  if (cache === undefined) {
    cache = {
      scanner: createScanner(/* skipTrivia */ true, sourceFile.languageVariant, sourceFile.text),
      tokens: new Map<string, Node>(),
    };
    fileCaches.set(sourceFile, cache);
  }
  return cache;
}
