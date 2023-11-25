import { SyntaxKind, ts } from "@ts-morph/common";

/** @internal */
export enum CommentNodeKind {
  Statement,
  ClassElement,
  TypeElement,
  ObjectLiteralElement,
  EnumMember,
}

export abstract class CompilerCommentNode implements ts.Node {
  #fullStart: number;
  #start: number;
  #sourceFile: ts.SourceFile;

  /** @private */
  constructor(
    fullStart: number,
    pos: number,
    end: number,
    kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia,
    sourceFile: ts.SourceFile,
    parent: ts.Node,
  ) {
    this.#fullStart = fullStart;
    this.#start = pos; // pos and start are the same for comments
    this.#sourceFile = sourceFile;
    this.pos = pos;
    this.end = end;
    this.kind = kind;
    this.flags = ts.NodeFlags.None;
    this.parent = parent;
  }

  /** @internal */
  abstract _commentKind: CommentNodeKind;

  pos: number;
  end: number;
  kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
  flags: ts.NodeFlags;
  modifiers?: ts.NodeArray<ts.Modifier> | undefined;
  parent: ts.Node;

  getSourceFile() {
    return this.#sourceFile;
  }

  getChildCount(sourceFile?: ts.SourceFile | undefined): number {
    return 0;
  }

  getChildAt(index: number, sourceFile?: ts.SourceFile | undefined) {
    return undefined as any as ts.Node; // the compiler definition is wrong
  }

  // @code-fence-allow(getChildren): this is an implementation, so it's ok.
  getChildren(sourceFile?: ts.SourceFile | undefined): ts.Node[] {
    return [];
  }

  getStart(sourceFile?: ts.SourceFile | undefined, includeJsDocComment?: boolean | undefined) {
    return this.#start;
  }

  getFullStart() {
    return this.#fullStart;
  }

  getEnd() {
    return this.end;
  }

  getWidth(sourceFile?: ts.SourceFileLike | undefined) {
    return this.end - this.#start;
  }

  getFullWidth(): number {
    return this.end - this.#fullStart;
  }

  getLeadingTriviaWidth(sourceFile?: ts.SourceFile | undefined) {
    return this.#start - this.#fullStart;
  }

  getFullText(sourceFile?: ts.SourceFile | undefined) {
    return this.#sourceFile.text.substring(this.#fullStart, this.end);
  }

  getText(sourceFile?: ts.SourceFile | undefined) {
    return this.#sourceFile.text.substring(this.#start, this.end);
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

export class CompilerCommentStatement extends CompilerCommentNode implements ts.Statement {
  _jsdocContainerBrand: any;
  _statementBrand: any;
  /** @internal */
  _commentKind = CommentNodeKind.Statement;
}

export class CompilerCommentClassElement extends CompilerCommentNode implements ts.ClassElement {
  _classElementBrand: any;
  _declarationBrand: any;
  /** @internal */
  _commentKind = CommentNodeKind.ClassElement;
}

export class CompilerCommentTypeElement extends CompilerCommentNode implements ts.TypeElement {
  _typeElementBrand: any;
  _declarationBrand: any;
  /** @internal */
  _commentKind = CommentNodeKind.TypeElement;
}

export class CompilerCommentObjectLiteralElement extends CompilerCommentNode implements ts.ObjectLiteralElement {
  _declarationBrand: any;
  _objectLiteralBrand: any;
  declarationBrand: any;
  /** @internal */
  _commentKind = CommentNodeKind.ObjectLiteralElement;
}

export class CompilerCommentEnumMember extends CompilerCommentNode implements ts.Node {
  /** @internal */
  _commentKind = CommentNodeKind.EnumMember;
}
