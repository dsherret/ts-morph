import { errors, getSyntaxKindName, StringUtils, ts, SyntaxKind } from "@ts-morph/common";
import { CompilerCommentNode, CompilerCommentList, CompilerCommentStatement, CompilerCommentClassElement, CompilerCommentTypeElement, CompilerCommentObjectLiteralElement,
    CompilerCommentEnumMember, CommentListKind } from "./CompilerComments";
import { createCommentScanner, CommentScanner } from "./createCommentScanner";

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

const childrenSaver = new WeakMap<ContainerNodes, (ts.Node | CompilerCommentList)[]>();
const tokenSaver = new WeakMap<ts.Node, (ts.Node | CompilerCommentList)[]>();
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

    static getOrParseTokens(node: ts.Node, sourceFile: ts.SourceFile) {
        let tokens = tokenSaver.get(node);
        if (tokens == null) {
            tokens = getTokens();
            tokenSaver.set(node, tokens);
        }
        return tokens;

        function getTokens() {
            if (CommentNodeParser.isCommentList(node))
                return node.comments;
            if (isSyntaxList(node) && isChildSyntaxList(node, sourceFile))
                return parseChildSyntaxList(node);
            return parseNode();
        }

        function parseChildSyntaxList(syntaxList: ts.SyntaxList) {
            const result: ts.Node[] = [];
            const children = CommentNodeParser.getOrParseChildren(syntaxList, sourceFile)
            const commentScanner = getScannerForSourceFile(sourceFile);

            commentScanner.setParent(syntaxList.parent); // not the syntax list (similar to other nodes)
            commentScanner.setFullStartAndPos(syntaxList.pos);

            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                // getStart(sourceFile, true) is broken in ts <= 3.7.2 (see PR #35029 in typescript repo)
                const childStart = ((child as any).jsDoc?.[0] || child).getStart(sourceFile);
                for (const comment of commentScanner.scanUntilToken()) {
                    // we stumbled upon the comment list or jsdoc... break
                    if (comment.pos === childStart)
                        break;
                    result.push(comment);
                }

                result.push(child);

                commentScanner.setFullStartAndPos(child.end);
            }

            for (const comment of commentScanner.scanUntilToken()) {
                if (comment.pos > syntaxList.end)
                    break;

                result.push(comment);
            }

            return result;
        }

        function parseNode() {
            const children = node.getChildren(sourceFile);
            if (children.length <= 1)
                return children;
            const result: ts.Node[] = [children[0]];
            const commentScanner = getScannerForSourceFile(sourceFile);
            commentScanner.setParent(node);
            for (let i = 1; i < children.length; i++) {
                // Skip checking for comments before an EndOfFileToken since that may accidentally capture comments.
                // It will always be: (SourceFile -> [SyntaxList, EndOfFileToken])
                if (children[i].kind !== ts.SyntaxKind.EndOfFileToken) {
                    // Use the past end because the current pos might be before the
                    // last child (ex. if the previous child was a JSDocComment and the
                    // current child is not).
                    commentScanner.setFullStartAndPos(children[i - 1].end);
                    for (const comment of commentScanner.scanUntilToken())
                        result.push(comment);
                }
                result.push(children[i]);
            }
            return result;
        }
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

    static hasParsedTokens(node: ts.Node) {
        return tokenSaver.has(node);
    }

    static isCommentStatement(node: ts.Node): node is CompilerCommentStatement {
        return (node as CompilerCommentList).commentListKind === CommentListKind.Statement;
    }

    static isCommentClassElement(node: ts.Node): node is CompilerCommentClassElement {
        return (node as CompilerCommentList).commentListKind === CommentListKind.ClassElement;
    }

    static isCommentTypeElement(node: ts.Node): node is CompilerCommentTypeElement {
        return (node as CompilerCommentList).commentListKind === CommentListKind.TypeElement;
    }

    static isCommentObjectLiteralElement(node: ts.Node): node is CompilerCommentObjectLiteralElement {
        return (node as CompilerCommentList).commentListKind === CommentListKind.ObjectLiteralElement;
    }

    static isCommentEnumMember(node: ts.Node): node is CompilerCommentEnumMember {
        return (node as CompilerCommentList).commentListKind === CommentListKind.EnumMember;
    }

    static isCommentList(node: ts.Node): node is CompilerCommentList {
        return typeof (node as CompilerCommentList).commentListKind === "number";
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
            const token = node.getChildren(sourceFile).find(c => c.kind === kind);
            if (token == null)
                throw new errors.NotImplementedError(`Unexpected scenario where a(n) ${getSyntaxKindName(kind)} was not found.`);
            return token.end;
        }
    }
}

function* getNodes(container: ContainerNodes, sourceFile: ts.SourceFile): IterableIterator<ts.Node | CompilerCommentList> {
    const scanner = getScannerForSourceFile(sourceFile);
    const sourceFileText = sourceFile.text;
    const childNodes = getContainerChildren();
    const createCommentList = getCreationFunction();

    scanner.setParent(container);

    if (childNodes.length === 0) {
        const bodyStartPos = CommentNodeParser.getContainerBodyPos(container, sourceFile);
        scanner.setFullStartAndPos(bodyStartPos);
        yield* getCommentNodes(false); // do not skip js docs because they won't have a node to be attached to
    }
    else {
        for (const childNode of childNodes) {
            scanner.setFullStartAndPos(childNode.pos);
            yield* getCommentNodes(true);
            yield childNode;
        }

        // get the comments on a newline after the last node
        const lastChild = childNodes[childNodes.length - 1];
        scanner.setFullStartAndPos(lastChild.end);
        yield* getCommentNodes(false); // parse any jsdocs afterwards
    }

    function* getCommentNodes(stopAtJsDoc: boolean) {
        skipTrailingLine();

        const leadingComments = Array.from(getLeadingComments());
        // `pos` will be at the first significant token of the next node or at the source file length.
        // At this point, allow comments that end at the end of the source file or on the same line as the close brace token
        const pos = scanner.getPos();
        const maxEnd = sourceFileText.length === pos || sourceFileText[pos] === "}" ? pos : StringUtils.getLineStartFromPos(sourceFileText, pos);

        for (const leadingComment of leadingComments) {
            if (leadingComment.end <= maxEnd)
                yield leadingComment;
        }

        function skipTrailingLine() {
            // skip first line of the block as the comment there is likely to describe the header
            if (scanner.getPos() === 0)
                return;

            // todo: clean this up
            while (true) {
                for (const _ of scanner.scanUntilNewLineOrToken()) {
                    // do nothing, drain the iterator
                }

                // skip any trailing commas too
                if (sourceFileText[scanner.getPos()] !== ",")
                    return;
                scanner.setPos(scanner.getPos() + 1);
            }
        }

        function* getLeadingComments() {
            while (true) {
                const comments = Array.from(scanner.scanForNewLines());
                if (comments.length === 0)
                    return;

                if (stopAtJsDoc && comments.some(isJsDocComment))
                    return;

                const firstComment = comments[0];
                const lastComment = comments[comments.length - 1];
                yield createCommentList(firstComment.getFullStart(), firstComment.pos, lastComment.end, comments);
            }
        }

        function isJsDocComment(comment: CompilerCommentNode) {
            const text = comment.getText();
            return text.startsWith("/**") && text !== "/***/";
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

    function getCreationFunction(): (
        fullStart: number,
        pos: number,
        end: number,
        comments: CompilerCommentNode[]
    ) => CompilerCommentList {
        const ctor = getCtor();
        return (fullStart: number, pos: number, end: number, comments: CompilerCommentNode[]) => {
            return new ctor(fullStart, pos, end, sourceFile, container, comments);
        }

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

const singleSyntaxListParents = new Set<SyntaxKind>([
    SyntaxKind.SourceFile,
    SyntaxKind.Block,
    SyntaxKind.ModuleBlock,
    SyntaxKind.CaseClause,
    SyntaxKind.DefaultClause,
    SyntaxKind.JsxElement
]);
const openBraceSyntaxListParents = new Set<SyntaxKind>([
    SyntaxKind.ClassDeclaration,
    SyntaxKind.InterfaceDeclaration,
    SyntaxKind.EnumDeclaration,
    SyntaxKind.ClassExpression,
    SyntaxKind.TypeLiteral,
    SyntaxKind.ObjectLiteralExpression
]);
function isChildSyntaxList(node: ts.SyntaxList, sourceFile: ts.SourceFile) {
    const parent = node.parent;
    if (singleSyntaxListParents.has(parent.kind))
        return true;
    if (!openBraceSyntaxListParents.has(parent.kind))
        return false;

    // search for the syntax list after the open brace token
    let passedBrace = false;
    for (const child of parent.getChildren(sourceFile)) {
        if (passedBrace)
            return child === node;
        if (child.kind === SyntaxKind.OpenBraceToken)
            passedBrace = true;
    }

    return false;
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

const cachedScanners = new WeakMap<ts.SourceFile, CommentScanner>();
function getScannerForSourceFile(sourceFile: ts.SourceFile) {
    let scanner = cachedScanners.get(sourceFile);
    if (scanner == null) {
        scanner = createCommentScanner(sourceFile);
        cachedScanners.set(sourceFile, scanner);
    }
    return scanner;
}