import { errors, getSyntaxKindName, StringUtils, ts, SyntaxKind } from "@ts-morph/common";
import { CompilerCommentNode, CompilerCommentStatement, CompilerCommentClassElement, CompilerCommentTypeElement, CompilerCommentObjectLiteralElement,
    CompilerCommentEnumMember, CommentNodeKind } from "../comment/CompilerComments";

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

type CommentSyntaxKinds = SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
const childrenSaver = new WeakMap<ContainerNodes, (ts.Node | CompilerCommentNode)[]>();
const commentNodeParserKinds = new Set<SyntaxKind>([
    SyntaxKind.SourceFile,
    SyntaxKind.Block,
    SyntaxKind.ModuleBlock,
    SyntaxKind.CaseClause,
    SyntaxKind.DefaultClause,
    SyntaxKind.ClassDeclaration,
    SyntaxKind.InterfaceDeclaration,
    SyntaxKind.EnumDeclaration,
    SyntaxKind.ClassExpression,
    SyntaxKind.TypeLiteral,
    SyntaxKind.ObjectLiteralExpression
]);

export class CommentNodeParser {
    private constructor() {
    }

    static getOrParseChildren(container: ContainerNodes | ts.SyntaxList, sourceFile: ts.SourceFile) {
        // always store the syntax list result on the parent so that a second array isn't created
        if (isSyntaxList(container))
            container = container.parent as ContainerNodes;

        // cache the result
        let children = childrenSaver.get(container);
        if (children == null) {
            children = Array.from(getNodes(container, sourceFile));
            childrenSaver.set(container, children);
        }

        return children;
    }

    static shouldParseChildren(container: ts.Node): container is ContainerNodes {
        // this needs to be really fast because it's used whenever getting the children, so use a map
        return commentNodeParserKinds.has(container.kind)
            // Ignore zero length nodes... for some reason this might happen when parsing
            // jsx in non-jsx files.
            && container.pos !== container.end;
    }

    static hasParsedChildren(container: ContainerNodes | ts.SyntaxList) {
        if (isSyntaxList(container))
            container = container.parent as ContainerNodes;

        return childrenSaver.has(container);
    }

    static isCommentStatement(node: ts.Node): node is CompilerCommentStatement {
        return (node as CompilerCommentNode)._commentKind === CommentNodeKind.Statement;
    }

    static isCommentClassElement(node: ts.Node): node is CompilerCommentClassElement {
        return (node as CompilerCommentNode)._commentKind === CommentNodeKind.ClassElement;
    }

    static isCommentTypeElement(node: ts.Node): node is CompilerCommentTypeElement {
        return (node as CompilerCommentNode)._commentKind === CommentNodeKind.TypeElement;
    }

    static isCommentObjectLiteralElement(node: ts.Node): node is CompilerCommentObjectLiteralElement {
        return (node as CompilerCommentNode)._commentKind === CommentNodeKind.ObjectLiteralElement;
    }

    static isCommentEnumMember(node: ts.Node): node is CompilerCommentEnumMember {
        return (node as CompilerCommentNode)._commentKind === CommentNodeKind.EnumMember;
    }

    static getContainerBodyPos(container: ContainerNodes, sourceFile: ts.SourceFile) {
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

        function getTokenEnd(node: ts.Node, kind: SyntaxKind.OpenBraceToken | SyntaxKind.ColonToken) {
            // @code-fence-allow(getChildren): Ok, not searching for comments.
            const token = node.getChildren(sourceFile).find(c => c.kind === kind);
            if (token == null)
                throw new errors.NotImplementedError(`Unexpected scenario where a(n) ${getSyntaxKindName(kind)} was not found.`);
            return token.end;
        }
    }
}

function* getNodes(container: ContainerNodes, sourceFile: ts.SourceFile): IterableIterator<ts.Node | CompilerCommentNode> {
    const sourceFileText = sourceFile.text;
    const childNodes = getContainerChildren();
    const createComment = getCreationFunction();

    if (childNodes.length === 0) {
        const bodyStartPos = CommentNodeParser.getContainerBodyPos(container, sourceFile);
        yield* getCommentNodes(bodyStartPos, false); // do not skip js docs because they won't have a node to be attached to
    }
    else {
        for (const childNode of childNodes) {
            yield* getCommentNodes(childNode.pos, true);
            yield childNode;
        }

        // get the comments on a newline after the last node
        const lastChild = childNodes[childNodes.length - 1];
        yield* getCommentNodes(lastChild.end, false); // parse any jsdocs afterwards
    }

    function* getCommentNodes(pos: number, stopAtJsDoc: boolean) {
        const fullStart = pos;
        skipTrailingLine();

        const leadingComments = Array.from(getLeadingComments());
        // `pos` will be at the first significant token of the next node or at the source file length.
        // At this point, allow comments that end at the end of the source file or on the same line as the close brace token
        const maxEnd = sourceFileText.length === pos || sourceFileText[pos] === "}" ? pos : StringUtils.getLineStartFromPos(sourceFileText, pos);

        for (const leadingComment of leadingComments) {
            if (leadingComment.end <= maxEnd)
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
                // skip any trailing comments too
                else if (!StringUtils.isWhitespace(sourceFileText[pos]) && sourceFileText[pos] !== ",")
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

        function parseSingleLineComment() {
            const start = pos;
            skipSingleLineComment();
            const end = pos;

            return createComment(fullStart, start, end, SyntaxKind.SingleLineCommentTrivia);
        }

        function skipSingleLineComment() {
            pos += 2; // skip the slash slash

            while (pos < sourceFileText.length && sourceFileText[pos] !== "\n" && sourceFileText[pos] !== "\r")
                pos++;
        }

        function parseMultiLineComment(isJsDoc: boolean) {
            const start = pos;
            skipSlashStarComment(isJsDoc);
            const end = pos;

            return createComment(fullStart, start, end, SyntaxKind.MultiLineCommentTrivia);
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

    function getContainerChildren() {
        if (ts.isSourceFile(container) || ts.isBlock(container) || ts.isModuleBlock(container) || ts.isCaseClause(container) || ts.isDefaultClause(container))
            return container.statements;

        if (ts.isClassDeclaration(container)
            || ts.isClassExpression(container)
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

    function getCreationFunction(): (fullStart: number, pos: number, end: number, kind: CommentSyntaxKinds) => CompilerCommentNode {
        const ctor = getCtor();
        return (fullStart: number, pos: number, end: number, kind: CommentSyntaxKinds) => new ctor(fullStart, pos, end, kind, sourceFile, container);

        function getCtor() {
            if (isStatementContainerNode(container))
                return CompilerCommentStatement;
            if (ts.isClassLike(container))
                return CompilerCommentClassElement;
            if (ts.isInterfaceDeclaration(container) || ts.isTypeLiteralNode(container))
                return CompilerCommentTypeElement;
            if (ts.isObjectLiteralExpression(container))
                return CompilerCommentObjectLiteralElement;
            if (ts.isEnumDeclaration(container))
                return CompilerCommentEnumMember;

            throw new errors.NotImplementedError(`Not implemented comment node container type: ${getSyntaxKindName(container.kind)}`);
        }
    }
}

function isSyntaxList(node: ts.Node): node is ts.SyntaxList {
    return node.kind === SyntaxKind.SyntaxList;
}

function isStatementContainerNode(node: ts.Node) {
    return getStatementContainerNode() != null;

    function getStatementContainerNode(): StatementContainerNodes | undefined {
        // this is a bit of a hack so the type checker ensures this is correct
        const container = node as any as StatementContainerNodes;
        if (ts.isSourceFile(container)
            || ts.isBlock(container)
            || ts.isModuleBlock(container)
            || ts.isCaseClause(container)
            || ts.isDefaultClause(container))
        {
            return container;
        }

        const assertNever: never = container;
        return undefined;
    }
}
