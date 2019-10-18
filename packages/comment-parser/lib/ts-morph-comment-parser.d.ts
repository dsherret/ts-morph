import { ts, SyntaxKind } from "@ts-morph/common";

export declare type StatementContainerNodes = ts.SourceFile | ts.Block | ts.ModuleBlock | ts.CaseClause | ts.DefaultClause;

export declare type ContainerNodes = StatementContainerNodes | ts.ClassDeclaration | ts.InterfaceDeclaration | ts.EnumDeclaration | ts.ClassExpression | ts.TypeLiteralNode | ts.ObjectLiteralExpression;

export declare class CommentNodeParser {
    private constructor();
    static getOrParseChildren(container: ContainerNodes | ts.SyntaxList, sourceFile: ts.SourceFile): (ts.Node | CompilerCommentNode)[];
    static shouldParseChildren(container: ts.Node): container is ContainerNodes;
    static hasParsedChildren(container: ContainerNodes | ts.SyntaxList): boolean;
    static isCommentStatement(node: ts.Node): node is CompilerCommentStatement;
    static isCommentClassElement(node: ts.Node): node is CompilerCommentClassElement;
    static isCommentTypeElement(node: ts.Node): node is CompilerCommentTypeElement;
    static isCommentObjectLiteralElement(node: ts.Node): node is CompilerCommentObjectLiteralElement;
    static isCommentEnumMember(node: ts.Node): node is CompilerCommentEnumMember;
    static getContainerBodyPos(container: ContainerNodes, sourceFile: ts.SourceFile): number;
}

export declare enum CommentNodeKind {
    Statement = 0,
    ClassElement = 1,
    TypeElement = 2,
    ObjectLiteralElement = 3,
    EnumMember = 4
}

export declare abstract class CompilerCommentNode implements ts.Node {
    constructor(fullStart: number, pos: number, end: number, kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia, sourceFile: ts.SourceFile, parent: ts.Node);
    abstract commentKind: CommentNodeKind;
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

export declare class CompilerCommentStatement extends CompilerCommentNode implements ts.Statement {
    _statementBrand: any;
    commentKind: CommentNodeKind;
}

export declare class CompilerCommentClassElement extends CompilerCommentNode implements ts.ClassElement {
    _classElementBrand: any;
    _declarationBrand: any;
    commentKind: CommentNodeKind;
}

export declare class CompilerCommentTypeElement extends CompilerCommentNode implements ts.TypeElement {
    _typeElementBrand: any;
    _declarationBrand: any;
    commentKind: CommentNodeKind;
}

export declare class CompilerCommentObjectLiteralElement extends CompilerCommentNode implements ts.ObjectLiteralElement {
    _declarationBrand: any;
    _objectLiteralBrandBrand: any;
    _objectLiteralBrand: any;
    declarationBrand: any;
    commentKind: CommentNodeKind;
}

export declare class CompilerCommentEnumMember extends CompilerCommentNode implements ts.Node {
    commentKind: CommentNodeKind;
}

export declare function isComment(node: {
    kind: ts.SyntaxKind;
}): boolean;
