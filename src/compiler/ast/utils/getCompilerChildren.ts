import { ts, SyntaxKind } from "../../../typescript";
import { ExtendedCommentParser } from "./ExtendedCommentParser";

const compilerForEachChildrenSaver = new WeakMap<ts.Node, ts.Node[]>();
export function getCompilerForEachChildren(node: ts.Node, sourceFile: ts.SourceFile) {
    let result = compilerForEachChildrenSaver.get(node);
    if (result == null) {
        result = getResult();
        compilerForEachChildrenSaver.set(node, result);
    }
    return result;

    function getResult() {
        const children: ts.Node[] = [];
        node.forEachChild(child => {
            children.push(child);
        });

        // insert all the comments in the correct place (be as fast as possible here as this is used a lot)
        if (ExtendedCommentParser.shouldParseChildren(node))
            mergeInComments(children, ExtendedCommentParser.getOrParseChildren(sourceFile, node));

        return children;
    }
}

const compilerChildrenSaver = new WeakMap<ts.Node, ts.Node[]>();
export function getCompilerChildren(node: ts.Node, sourceFile: ts.SourceFile) {
    let result = compilerChildrenSaver.get(node);
    if (result == null) {
        result = getResult();
        compilerChildrenSaver.set(node, result);
    }
    return result;

    function getResult() {
        const children = [...node.getChildren(sourceFile)]; // do not modify the compiler api's array

        if (isStatementMemberOrPropertyHoldingSyntaxList())
            mergeInComments(children, ExtendedCommentParser.getOrParseChildren(sourceFile, node as ts.SyntaxList));

        return children;

        function isStatementMemberOrPropertyHoldingSyntaxList() {
            if (node.kind !== ts.SyntaxKind.SyntaxList)
                return false;
            const parent = node.parent;
            if (!ExtendedCommentParser.shouldParseChildren(parent))
                return false;

            // is this the correct syntax list?
            return ExtendedCommentParser.getContainerBodyPos(parent, sourceFile) === node.pos;
        }
    }
}

function mergeInComments(nodes: ts.Node[], otherNodes: ts.Node[]) {
    let currentIndex = 0;
    // assumes the arrays are sorted
    for (const child of otherNodes) {
        // do not use .filter to prevent needless allocations
        if (child.kind !== SyntaxKind.SingleLineCommentTrivia && child.kind !== SyntaxKind.MultiLineCommentTrivia)
            continue;

        while (currentIndex < nodes.length && nodes[currentIndex].end < child.end)
            currentIndex++;

        nodes.splice(currentIndex, 0, child);
        currentIndex++;
    }
}
