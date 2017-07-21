import * as ts from "typescript";
import {Node} from "./../../compiler";

export abstract class Formatting<TNode extends Node, TStructure> {
    protected constructor(private readonly kind: ts.SyntaxKind) {
    }

    getKind() {
        return this.kind;
    }

    abstract getPrevious(member: TNode | TStructure, surroundingMember: TNode): FormattingKind;
    abstract getSeparator(parent: Node, structure: TStructure, nextStructure: TStructure): FormattingKind;
    abstract getNext(member: TNode | TStructure, surroundingMember: TNode): FormattingKind;
}

export enum FormattingKind {
    Newline,
    Blankline,
    Space,
    None
}
