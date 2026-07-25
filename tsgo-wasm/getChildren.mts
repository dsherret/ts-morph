/**
 * `getChildren()` for the new (tsgo) AST.
 *
 * The unstable AST exposes `forEachChild`, which visits only the nodes stored in
 * the tree — it skips punctuation/keyword tokens and does not surface the
 * `SyntaxList` nodes that ts-morph's wrappers expose. Classic TypeScript
 * reconstructs both in its services layer by scanning the gaps between stored
 * children, and this does the same, so ts-morph's `Node#getChildren()` and
 * `SyntaxList` can be preserved unchanged.
 */
import { createToken } from "../submodules/typescript-go/_packages/native-preview/src/ast/factory.generated.ts";
import { type Node, type NodeArray, type SourceFile, SyntaxKind } from "../submodules/typescript-go/_packages/native-preview/src/ast/index.ts";
import { createScanner, type Scanner } from "../submodules/typescript-go/_packages/native-preview/src/ast/scanner.ts";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Returns every child of `node` in source order, including tokens and
 * `SyntaxList` nodes, mirroring classic TypeScript's `Node#getChildren()`.
 */
export function getChildren(node: Node, sourceFile: SourceFile = node.getSourceFile()): Node[] {
    // Tokens and identifiers have no children in the classic services layer.
    if (node.kind <= SyntaxKind.LastToken) return [];

    const scanner = createScanner(/*skipTrivia*/ true, sourceFile.languageVariant, sourceFile.text);
    const children: Node[] = [];
    let pos = node.pos;

    node.forEachChild(
        child => {
            addSyntheticTokens(children, scanner, pos, child.pos, node);
            children.push(child);
            pos = child.end;
            return undefined;
        },
        nodes => {
            addSyntheticTokens(children, scanner, pos, nodes.pos, node);
            children.push(createSyntaxList(nodes, node, scanner));
            pos = nodes.end;
            return undefined;
        },
    );
    addSyntheticTokens(children, scanner, pos, node.end, node);
    return children;
}

/** Builds the `SyntaxList` node that stands in for a stored node array. */
function createSyntaxList(nodes: NodeArray<Node>, parent: Node, scanner: Scanner): Node {
    const list = createToken(SyntaxKind.SyntaxList as never) as unknown as Mutable<Node> & { _children: Node[] };
    list.pos = nodes.pos;
    list.end = nodes.end;
    list.parent = parent;

    const children: Node[] = [];
    let pos = nodes.pos;
    for (const node of nodes) {
        addSyntheticTokens(children, scanner, pos, node.pos, list as unknown as Node);
        children.push(node);
        pos = node.end;
    }
    addSyntheticTokens(children, scanner, pos, nodes.end, list as unknown as Node);
    list._children = children;
    return list as unknown as Node;
}

/** Returns the children of a node produced by {@link createSyntaxList}. */
export function getSyntaxListChildren(list: Node): Node[] {
    return (list as unknown as { _children?: Node[] })._children ?? [];
}

/** Scans `[pos, end)` and appends every token found to `children`. */
function addSyntheticTokens(children: Node[], scanner: Scanner, pos: number, end: number, parent: Node): void {
    scanner.resetTokenState(pos);
    while (pos < end) {
        const kind = scanner.scan();
        const tokenEnd = scanner.getTokenEnd();
        if (tokenEnd <= end) {
            const token = createToken(kind as never) as unknown as Mutable<Node>;
            token.pos = pos;
            token.end = tokenEnd;
            token.parent = parent;
            children.push(token as Node);
        }
        pos = tokenEnd;
        if (kind === SyntaxKind.EndOfFile) break;
    }
}
