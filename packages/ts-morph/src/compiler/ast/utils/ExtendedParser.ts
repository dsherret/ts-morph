import { ts, SyntaxKind } from "@ts-morph/common";
import { CommentNodeParser, ContainerNodes } from "./CommentNodeParser";
import { hasParsedTokens } from "./hasParsedTokens";

const forEachChildSaver = new WeakMap<ts.Node, ts.Node[]>();
const getChildrenSaver = new WeakMap<ts.Node, ts.Node[]>();

/**
 * Parser that parses around nodes for comments.
 */
export class ExtendedParser {
    /** Gets the `#statements`, `#members`, or `#properties` array with comment nodes. */
    static getContainerArray(container: ContainerNodes, sourceFile: ts.SourceFile) {
        return CommentNodeParser.getOrParseChildren(container, sourceFile);
    }

    static getCompilerChildrenFast(node: ts.Node, sourceFile: ts.SourceFile) {
        if (hasParsedTokens(node))
            return ExtendedParser.getCompilerChildren(node, sourceFile);

        return ExtendedParser.getCompilerForEachChildren(node, sourceFile);
    }

    static getCompilerForEachChildren(node: ts.Node, sourceFile: ts.SourceFile) {
        if (CommentNodeParser.shouldParseChildren(node)) {
            let result = forEachChildSaver.get(node);
            if (result == null) {
                result = getForEachChildren();
                mergeInComments(result, CommentNodeParser.getOrParseChildren(node, sourceFile));
                forEachChildSaver.set(node, result);
            }
            return result;
        }

        return getForEachChildren();

        function getForEachChildren() {
            const children: ts.Node[] = [];
            node.forEachChild(child => {
                children.push(child);
            });
            return children;
        }
    }

    static getCompilerChildren(node: ts.Node, sourceFile: ts.SourceFile) {
        if (isStatementMemberOrPropertyHoldingSyntaxList()) {
            let result = getChildrenSaver.get(node);
            if (result == null) {
                // @code-fence-allow(getChildren): This merges in comment nodes.
                result = [...node.getChildren(sourceFile)]; // make a copy; do not modify the compiler api's array
                mergeInComments(result, CommentNodeParser.getOrParseChildren(node as ts.SyntaxList, sourceFile));
                getChildrenSaver.set(node, result);
            }
            return result;
        }

        // @code-fence-allow(getChildren): No need to merge in comment nodes.
        return node.getChildren(sourceFile);

        function isStatementMemberOrPropertyHoldingSyntaxList() {
            if (node.kind !== ts.SyntaxKind.SyntaxList)
                return false;
            const parent = node.parent;
            if (!CommentNodeParser.shouldParseChildren(parent))
                return false;

            // is this the correct syntax list?
            return CommentNodeParser.getContainerBodyPos(parent, sourceFile) === node.pos;
        }
    }
}

function mergeInComments(nodes: ts.Node[], otherNodes: ts.Node[]) {
    // insert all the comments in the correct place (be as fast as possible here as this is used a lot)
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
