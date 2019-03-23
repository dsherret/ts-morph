import { ts, SyntaxKind } from "../../../typescript";
import * as errors from "../../../errors";
import { StringUtils, HiddenPropSaver, getSyntaxKindName } from "../../../utils";

enum CommentKind {
    SingleLine,
    MultiLine,
    JsDoc
}

export type StatementContainerNodes = ts.SourceFile
    | ts.Block
    | ts.ModuleBlock
    | ts.CaseClause
    | ts.DefaultClause;

export type ContainerNodes = StatementContainerNodes
    | ts.ClassDeclaration
    | ts.InterfaceDeclaration
    | ts.EnumDeclaration
    | ts.ClassExpression
    | ts.TypeLiteralNode
    | ts.ObjectLiteralExpression;

const statementsSaver = new HiddenPropSaver<ContainerNodes, (ts.Node | ts.CommentRange)[]>();
export function getNodesWithStatementedComments(sourceFile: ts.SourceFile, container: ContainerNodes): (ts.Node | ts.CommentRange)[] {
    // cache the node similar to how the `_children` property works in the compiler API with `#getChildren()`
    let statements = statementsSaver.get(container);
    if (statements == null) {
        statements = Array.from(getNodes(sourceFile, container));
        statementsSaver.set(container, statements);
    }
    return statements;
}

function* getNodes(sourceFile: ts.SourceFile, container: ContainerNodes): IterableIterator<ts.Node | ts.CommentRange> {
    const sourceFileText = sourceFile.text;
    const childNodes = getContainerChildren();

    if (childNodes.length === 0) {
        const bodyStartPos = getContainerBodyStartPos();
        yield* getStatementedComments(bodyStartPos, false); // do not skip js docs because they won't have a node to be attached to
    }
    else {
        for (const childNode of childNodes) {
            yield* getStatementedComments(childNode.pos, true);
            yield childNode;
        }

        // get the comments on a newline after the last node
        const lastChild = childNodes[childNodes.length - 1];
        yield* getStatementedComments(lastChild.end, false); // parse any jsdocs afterwards
    }

    function* getStatementedComments(pos: number, stopAtJsDoc: boolean) {
        skipTrailingLine();

        const leadingComments = Array.from(getLeadingComments());
        // pos will be at the first significant token of the next node or at the source file length
        const lineStartPos = StringUtils.getLineStartFromPos(sourceFileText, pos);

        for (const leadingComment of leadingComments) {
            if (sourceFileText.length === pos || leadingComment.end < lineStartPos)
                yield leadingComment;
        }

        function skipTrailingLine() {
            // skip first line of the block as the comment there is likely to describe the header
            if (pos === 0)
                return;

            let lineEnd = StringUtils.getLineEndFromPos(sourceFileText, pos);

            while (pos < lineEnd) {
                const commentKind = getCommentKind();
                if (commentKind != null) {
                    const comment = parseForComment(commentKind);
                    if (comment.kind === SyntaxKind.SingleLineCommentTrivia)
                        return;
                    else
                        lineEnd = StringUtils.getLineEndFromPos(sourceFileText, pos);
                }
                else if (!StringUtils.isWhitespace(sourceFileText[pos]))
                    return;
                else
                    pos++;
            }

            while (StringUtils.startsWithNewLine(sourceFileText[pos]))
                pos++;
        }

        function* getLeadingComments() {
            while (pos < sourceFileText.length) {
                const commentKind = getCommentKind();
                if (commentKind != null) {
                    const isJsDoc = commentKind === CommentKind.JsDoc;
                    if (isJsDoc && stopAtJsDoc)
                        return;
                    else
                        yield parseForComment(commentKind);

                    // treat comments on same line as trailing
                    skipTrailingLine();
                }
                else if (!StringUtils.isWhitespace(sourceFileText[pos]))
                    return;
                else
                    pos++;
            }
        }

        function parseForComment(commentKind: CommentKind) {
            if (commentKind === CommentKind.SingleLine)
                return parseSingleLineComment();

            const isJsDoc = commentKind === CommentKind.JsDoc;
            return parseMultiLineComment(isJsDoc);
        }

        function getCommentKind() {
            const currentChar = sourceFileText[pos];
            if (currentChar !== "/")
                return undefined;

            const nextChar = sourceFileText[pos + 1];
            if (nextChar === "/")
                return CommentKind.SingleLine;

            if (nextChar !== "*")
                return undefined;

            const nextNextChar = sourceFileText[pos + 2];
            return nextNextChar === "*" ? CommentKind.JsDoc : CommentKind.MultiLine;
        }

        function parseSingleLineComment(): ts.CommentRange {
            const start = pos;
            skipSingleLineComment();

            return {
                kind: SyntaxKind.SingleLineCommentTrivia,
                pos: start,
                end: pos
            };
        }

        function skipSingleLineComment() {
            pos += 2; // skip the slash slash

            while (pos < sourceFileText.length && sourceFileText[pos] !== "\n" && sourceFileText[pos] !== "\r")
                pos++;
        }

        function parseMultiLineComment(isJsDoc: boolean): ts.CommentRange {
            const start = pos;

            skipSlashStarComment(isJsDoc);

            return {
                kind: SyntaxKind.MultiLineCommentTrivia,
                pos: start,
                end: pos
            };
        }

        function skipSlashStarComment(isJsDoc: boolean) {
            pos += isJsDoc ? 3 : 2; // skip slash star star or slash star

            while (pos < sourceFileText.length) {
                if (sourceFileText[pos] === "*" && sourceFileText[pos + 1] === "/") {
                    pos += 2; // skip star slash
                    break;
                }
                pos++;
            }
        }
    }

    function getContainerBodyStartPos() {
        if (ts.isSourceFile(container))
            return 0;

        if (ts.isClassDeclaration(container)
            || ts.isEnumDeclaration(container)
            || ts.isInterfaceDeclaration(container)
            || ts.isTypeLiteralNode(container)
            || ts.isClassExpression(container)
            || ts.isBlock(container)
            || ts.isModuleBlock(container)
            || ts.isObjectLiteralExpression(container))
        {
            // this function is only used when there are no statements or members, so only do this
            return getTokenEnd(container, SyntaxKind.OpenBraceToken);
        }

        if (ts.isCaseClause(container) || ts.isDefaultClause(container))
            return getTokenEnd(container, SyntaxKind.ColonToken);

        return errors.throwNotImplementedForNeverValueError(container);

        function getTokenEnd(node: ts.Node, kind: SyntaxKind) {
            const openBraceToken = node.getChildren(sourceFile).find(c => c.kind === kind);
            if (openBraceToken == null)
                throw new errors.NotImplementedError(`Unexpected scenario where a(n) ${getSyntaxKindName(kind)} was not found.`);
            return openBraceToken.end;
        }
    }

    function getContainerChildren() {
        if (ts.isSourceFile(container) || ts.isBlock(container) || ts.isModuleBlock(container) || ts.isCaseClause(container) || ts.isDefaultClause(container))
            return container.statements;

        if (ts.isClassDeclaration(container)
            || ts.isEnumDeclaration(container)
            || ts.isInterfaceDeclaration(container)
            || ts.isTypeLiteralNode(container)
            || ts.isClassExpression(container))
        {
            return container.members;
        }

        if (ts.isObjectLiteralExpression(container))
            return container.properties;

        return errors.throwNotImplementedForNeverValueError(container);
    }
}
