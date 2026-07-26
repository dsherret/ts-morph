/**
 * `getChildren()` for the tsgo AST.
 *
 * The new AST exposes `forEachChild`, which visits only the nodes stored in the
 * tree — it skips punctuation/keyword tokens, skips JSDoc, and does not surface
 * the `SyntaxList` nodes ts-morph's wrappers expose. Classic TypeScript rebuilds
 * all three in its services layer by scanning the gaps between stored children,
 * and this does the same.
 *
 * Results are cached per node. That is not only an optimization: ts-morph keys
 * its wrapper cache on compiler-node identity, so the tokens and syntax lists
 * synthesized here must be the *same objects* on every call.
 */
import { createToken } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/factory.generated.js";
import { type Node, type NodeArray, type SourceFile, SyntaxKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/index.js";
import { createScanner, type Scanner } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/scanner.js";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** Per-source-file scanner, paired with the file's shared token cache. */
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

  const children: Node[] = [];

  // The body of a doc comment is trivia to the scanner, so scanning it as code
  // would synthesize tokens classic TypeScript never produces (`*/` as an
  // asterisk and a slash, prose words as identifiers). Classic short-circuits
  // these nodes before scanning; so does this.
  if (isJSDocCommentContainingNode(node)) {
    node.forEachChild(child => {
      children.push(child);
      return undefined;
    });
    childrenCache.set(node, children);
    return children;
  }

  const cache = getFileCache(sourceFile);
  let pos = node.pos;

  const visitNode = (child: Node): undefined => {
    addSyntheticTokens(children, cache, pos, child.pos, node);
    children.push(child);
    pos = child.end;
    return undefined;
  };

  // Doc comments are stored off to the side rather than as forEachChild
  // children, but classic lists them first, before the node's own text.
  const jsDoc = node.jsDoc;
  if (jsDoc !== undefined) {
    for (const doc of jsDoc)
      visitNode(doc);
    pos = node.pos;
  }

  node.forEachChild(
    visitNode,
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
  const child = children[children.length - 1];
  if (child === undefined)
    return undefined;
  // Zero-width children count: the last token of a file with no trailing
  // newline is its empty EndOfFileToken, which is what classic returns.
  return child.kind <= SyntaxKind.LastToken ? child : getLastToken(child, sourceFile);
}

/**
 * Whether `node` is a doc comment or a part of one, matching classic
 * TypeScript's `isJSDocCommentContainingNode`. The kinds run from `JSDoc`
 * itself through the doc text, type literal, signature, links and every tag.
 */
function isJSDocCommentContainingNode(node: Node): boolean {
  return node.kind >= SyntaxKind.JSDoc && node.kind <= SyntaxKind.LastJSDocTagNode;
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
    // Separators are parented to the outer node, not to the list, matching
    // classic. `getParentSyntaxList` walks a token's parent's children looking
    // for the list that contains it, which only terminates if the token's
    // parent is the node *above* the list.
    addSyntheticTokens(children, cache, pos, node.pos, parent);
    children.push(node);
    pos = node.end;
  }
  addSyntheticTokens(children, cache, pos, nodes.end, parent);

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
    if (tokenEnd <= end) {
      // Classic re-scans with the plain scanner, which has no combined `</`
      // token, so a closing JSX tag comes back as two children. tsgo's scanner
      // produces one; split it so `<` and `/` are separate children as callers
      // expect.
      if (kind === SyntaxKind.LessThanSlashToken) {
        children.push(getOrCreateToken(cache, SyntaxKind.LessThanToken, pos, pos + 1, parent));
        children.push(getOrCreateToken(cache, SyntaxKind.SlashToken, pos + 1, tokenEnd, parent));
      } else {
        children.push(getOrCreateToken(cache, kind, pos, tokenEnd, parent));
      }
    }
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
    // Share the file's own token cache with astnav, which keys tokens the same
    // way. Otherwise a token reached through getTokenAtPosition and the same
    // token reached through getChildren would be two objects, and ts-morph
    // would wrap each of them separately.
    sourceFile.tokenCache ??= new Map<string, Node>();
    cache = {
      scanner: createScanner(/* skipTrivia */ true, sourceFile.languageVariant, sourceFile.text),
      tokens: sourceFile.tokenCache,
    };
    fileCaches.set(sourceFile, cache);
  }
  return cache;
}
