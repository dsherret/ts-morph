import { ts, SyntaxKind } from "@ts-morph/common";

export enum CommentListKind {
    Statement,
    ClassElement,
    TypeElement,
    ObjectLiteralElement,
    EnumMember
}

export class CompilerCommentNode implements ts.Node {
    /** @internal */
    private _fullStart: number;
    /** @internal */
    private _start: number;
    /** @internal */
    private _sourceFile: ts.SourceFile;

    constructor(
        fullStart: number,
        pos: number,
        end: number,
        kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia,
        sourceFile: ts.SourceFile,
        parent: ts.Node
    ) {
        this._fullStart = fullStart;
        this._start = pos; // pos and start are the same for comments
        this._sourceFile = sourceFile;
        this.pos = pos;
        this.end = end;
        this.kind = kind;
        this.flags = ts.NodeFlags.None;
        this.parent = parent;
    }

    pos: number;
    end: number;
    kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
    flags: ts.NodeFlags;
    decorators?: ts.NodeArray<ts.Decorator> | undefined;
    modifiers?: ts.NodeArray<ts.Modifier> | undefined;
    parent: ts.Node;

    getSourceFile() {
        return this._sourceFile;
    }

    getChildCount(sourceFile?: ts.SourceFile | undefined): number {
        return 0;
    }

    getChildAt(index: number, sourceFile?: ts.SourceFile | undefined) {
        return undefined as any as ts.Node; // the compiler definition is wrong
    }

    getChildren(sourceFile?: ts.SourceFile | undefined): ts.Node[] {
        return [];
    }

    getStart(sourceFile?: ts.SourceFile | undefined, includeJsDocComment?: boolean | undefined) {
        return this._start;
    }

    getFullStart() {
        return this._fullStart;
    }

    getEnd() {
        return this.end;
    }

    getWidth(sourceFile?: ts.SourceFileLike | undefined) {
        return this.end - this._start;
    }

    getFullWidth(): number {
        return this.end - this._fullStart;
    }

    getLeadingTriviaWidth(sourceFile?: ts.SourceFile | undefined) {
        return this._start - this._fullStart;
    }

    getFullText(sourceFile?: ts.SourceFile | undefined) {
        return this._sourceFile.text.substring(this._fullStart, this.end);
    }

    getText(sourceFile?: ts.SourceFile | undefined) {
        return this._sourceFile.text.substring(this._start, this.end);
    }

    getFirstToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined {
        return undefined;
    }

    getLastToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined {
        return undefined;
    }

    forEachChild<T>(cbNode: (node: ts.Node) => T | undefined, cbNodeArray?: ((nodes: ts.NodeArray<ts.Node>) => T | undefined) | undefined): T | undefined {
        return undefined;
    }
}

export abstract class CompilerCommentList implements ts.Node {
    /** @internal */
    private _fullStart: number;
    /** @internal */
    private _start: number;
    /** @internal */
    private _sourceFile: ts.SourceFile;

    constructor(
        fullStart: number,
        pos: number,
        end: number,
        sourceFile: ts.SourceFile,
        parent: ts.Node,
        comments: ReadonlyArray<CompilerCommentNode>
    ) {
        this._fullStart = fullStart;
        this._start = pos; // pos and start are the same for comments
        this._sourceFile = sourceFile;
        this.pos = pos;
        this.end = end;
        this.flags = ts.NodeFlags.None;
        this.parent = parent;
        this.comments = comments as CompilerCommentNode[];
    }

    abstract commentListKind: CommentListKind;

    pos: number;
    end: number;
    flags: ts.NodeFlags;
    decorators?: ts.NodeArray<ts.Decorator> | undefined;
    modifiers?: ts.NodeArray<ts.Modifier> | undefined;
    parent: ts.Node;
    comments: CompilerCommentNode[];
    kind = -100 as ts.SyntaxKind;

    getSourceFile() {
        return this._sourceFile;
    }

    getChildCount(sourceFile?: ts.SourceFile | undefined): number {
        return this.comments.length;
    }

    getChildAt(index: number, sourceFile?: ts.SourceFile | undefined) {
        return this.comments[index]; // the compiler definition is wrong
    }

    getChildren(sourceFile?: ts.SourceFile | undefined): ts.Node[] {
        return this.comments;
    }

    getStart(sourceFile?: ts.SourceFile | undefined, includeJsDocComment?: boolean | undefined) {
        return this._start;
    }

    getFullStart() {
        return this._fullStart;
    }

    getEnd() {
        return this.end;
    }

    getWidth(sourceFile?: ts.SourceFileLike | undefined) {
        return this.end - this._start;
    }

    getFullWidth(): number {
        return this.end - this._fullStart;
    }

    getLeadingTriviaWidth(sourceFile?: ts.SourceFile | undefined) {
        return this._start - this._fullStart;
    }

    getFullText(sourceFile?: ts.SourceFile | undefined) {
        return this._sourceFile.text.substring(this._fullStart, this.end);
    }

    getText(sourceFile?: ts.SourceFile | undefined) {
        return this._sourceFile.text.substring(this._start, this.end);
    }

    getFirstToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined {
        return this.comments[0];
    }

    getLastToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined {
        return this.comments[this.comments.length - 1];
    }

    forEachChild<T>(cbNode: (node: ts.Node) => T | undefined, cbNodeArray?: ((nodes: ts.NodeArray<ts.Node>) => T | undefined) | undefined): T | undefined {
        return undefined;
    }
}

export class CompilerCommentStatement extends CompilerCommentList implements ts.Statement {
    _statementBrand: any;
    commentListKind = CommentListKind.Statement;
}

export class CompilerCommentClassElement extends CompilerCommentList implements ts.ClassElement {
    _classElementBrand: any;
    _declarationBrand: any;
    commentListKind = CommentListKind.ClassElement;
}

export class CompilerCommentTypeElement extends CompilerCommentList implements ts.TypeElement {
    _typeElementBrand: any;
    _declarationBrand: any;
    commentListKind = CommentListKind.TypeElement;
}

export class CompilerCommentObjectLiteralElement extends CompilerCommentList implements ts.ObjectLiteralElement {
    _declarationBrand: any;
    _objectLiteralBrandBrand: any; // ts < 3.4
    _objectLiteralBrand: any; // ts >= 3.5
    declarationBrand: any;
    commentListKind = CommentListKind.ObjectLiteralElement;
}

export class CompilerCommentEnumMember extends CompilerCommentList implements ts.Node {
    commentListKind = CommentListKind.EnumMember;
}
