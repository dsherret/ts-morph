import * as ts from "typescript";
import {Node} from "./../../../compiler";
import {FormattingKind} from "./../FormattingKind";

export abstract class InsertFormatting<TNode extends Node = Node, TStructure = any> {
    constructor(
        protected parent: Node,
        protected children: Node[],
        protected previousMember: TNode | undefined,
        protected nextMember: TNode | undefined,
        protected firstStructure: TStructure | undefined,
        protected lastStructure: TStructure | undefined
    ) {
    }

    abstract getInsertPos(): number;
    abstract getPrevious(): FormattingKind;
    abstract getSeparator(structure: TStructure, nextStructure: TStructure): FormattingKind;
    abstract getNext(): FormattingKind;
}
