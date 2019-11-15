import { ts, SyntaxKind } from "@ts-morph/common";

export declare type StatementContainerNodes = ts.SourceFile | ts.Block | ts.ModuleBlock | ts.CaseClause | ts.DefaultClause;

export declare type ContainerNodes = StatementContainerNodes | ts.ClassDeclaration | ts.InterfaceDeclaration | ts.EnumDeclaration | ts.ClassExpression | ts.TypeLiteralNode | ts.ObjectLiteralExpression;

export declare class CommentNodeParser {
    private constructor();
    static getOrParseTokens(node: ts.Node, sourceFile: ts.SourceFile): (ts.Node | CompilerCommentList)[];
    static getOrParseChildren(container: ContainerNodes | ts.SyntaxList, sourceFile: ts.SourceFile): (ts.Node | CompilerCommentList)[];
    static shouldParseChildren(container: ts.Node): container is ContainerNodes;
    static hasParsedChildren(container: ContainerNodes | ts.SyntaxList): boolean;
    static hasParsedTokens(node: ts.Node): boolean;
    static isCommentListStatement(node: ts.Node): node is CompilerCommentListStatement;
    static isCommentListClassElement(node: ts.Node): node is CompilerCommentListClassElement;
    static isCommentListTypeElement(node: ts.Node): node is CompilerCommentListTypeElement;
    static isCommentListObjectLiteralElement(node: ts.Node): node is CompilerCommentListObjectLiteralElement;
    static isCommentListEnumMember(node: ts.Node): node is CompilerCommentListEnumMember;
    static isCommentList(node: ts.Node): node is CompilerCommentList;
    static getContainerBodyPos(container: ContainerNodes, sourceFile: ts.SourceFile): number;
}

export declare enum CommentListKind {
    Statement = 0,
    ClassElement = 1,
    TypeElement = 2,
    ObjectLiteralElement = 3,
    EnumMember = 4
}

export declare class CompilerCommentNode implements ts.Node {
    constructor(fullStart: number, pos: number, end: number, kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia, sourceFile: ts.SourceFile, parent: ts.Node);
    pos: number;
    end: number;
    kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
    flags: ts.NodeFlags;
    decorators?: ts.NodeArray<ts.Decorator> | undefined;
    modifiers?: ts.NodeArray<ts.Modifier> | undefined;
    parent: ts.Node;
    getSourceFile(): ts.SourceFile;
    getChildCount(sourceFile?: ts.SourceFile | undefined): number;
    getChildAt(index: number, sourceFile?: ts.SourceFile | undefined): ts.Node;
    getChildren(sourceFile?: ts.SourceFile | undefined): ts.Node[];
    getStart(sourceFile?: ts.SourceFile | undefined, includeJsDocComment?: boolean | undefined): number;
    getFullStart(): number;
    getEnd(): number;
    getWidth(sourceFile?: ts.SourceFileLike | undefined): number;
    getFullWidth(): number;
    getLeadingTriviaWidth(sourceFile?: ts.SourceFile | undefined): number;
    getFullText(sourceFile?: ts.SourceFile | undefined): string;
    getText(sourceFile?: ts.SourceFile | undefined): string;
    getFirstToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined;
    getLastToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined;
    forEachChild<T>(cbNode: (node: ts.Node) => T | undefined, cbNodeArray?: ((nodes: ts.NodeArray<ts.Node>) => T | undefined) | undefined): T | undefined;
}

export declare abstract class CompilerCommentList implements ts.Node {
    constructor(fullStart: number, pos: number, end: number, sourceFile: ts.SourceFile, parent: ts.Node, comments: ReadonlyArray<CompilerCommentNode>);
    static kind: ts.SyntaxKind;
    abstract commentListKind: CommentListKind;
    pos: number;
    end: number;
    flags: ts.NodeFlags;
    decorators?: ts.NodeArray<ts.Decorator> | undefined;
    modifiers?: ts.NodeArray<ts.Modifier> | undefined;
    parent: ts.Node;
    comments: CompilerCommentNode[];
    kind: ts.SyntaxKind;
    getSourceFile(): ts.SourceFile;
    getChildCount(sourceFile?: ts.SourceFile | undefined): number;
    getChildAt(index: number, sourceFile?: ts.SourceFile | undefined): CompilerCommentNode;
    getChildren(sourceFile?: ts.SourceFile | undefined): ts.Node[];
    getStart(sourceFile?: ts.SourceFile | undefined, includeJsDocComment?: boolean | undefined): number;
    getFullStart(): number;
    getEnd(): number;
    getWidth(sourceFile?: ts.SourceFileLike | undefined): number;
    getFullWidth(): number;
    getLeadingTriviaWidth(sourceFile?: ts.SourceFile | undefined): number;
    getFullText(sourceFile?: ts.SourceFile | undefined): string;
    getText(sourceFile?: ts.SourceFile | undefined): string;
    getFirstToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined;
    getLastToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined;
    forEachChild<T>(cbNode: (node: ts.Node) => T | undefined, cbNodeArray?: ((nodes: ts.NodeArray<ts.Node>) => T | undefined) | undefined): T | undefined;
}

export declare class CompilerCommentListStatement extends CompilerCommentList implements ts.Statement {
    _statementBrand: any;
    commentListKind: CommentListKind;
}

export declare class CompilerCommentListClassElement extends CompilerCommentList implements ts.ClassElement {
    _classElementBrand: any;
    _declarationBrand: any;
    commentListKind: CommentListKind;
}

export declare class CompilerCommentListTypeElement extends CompilerCommentList implements ts.TypeElement {
    _typeElementBrand: any;
    _declarationBrand: any;
    commentListKind: CommentListKind;
}

export declare class CompilerCommentListObjectLiteralElement extends CompilerCommentList implements ts.ObjectLiteralElement {
    _declarationBrand: any;
    _objectLiteralBrand: any;
    declarationBrand: any;
    commentListKind: CommentListKind;
}

export declare class CompilerCommentListEnumMember extends CompilerCommentList implements ts.Node {
    commentListKind: CommentListKind;
}

export declare function isComment(node: {
    kind: ts.SyntaxKind;
}): boolean;
