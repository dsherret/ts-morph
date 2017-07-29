import * as ts from "typescript";
import {Node} from "./../../compiler";

export abstract class Formatting<TNode extends Node, TStructure> {
    constructor(
        protected parent: Node,
        protected children: Node[],
        protected previousMember: TNode | undefined,
        protected nextMember: TNode | undefined,
        protected firstStructure: TStructure | undefined,
        protected lastStructure: TStructure | undefined
    ) {
    }

    abstract getPrevious(): FormattingKind;
    abstract getSeparator(structure: TStructure, nextStructure: TStructure): FormattingKind;
    abstract getNext(): FormattingKind;
}

export enum FormattingKind {
    Newline,
    Blankline,
    Space,
    None
}
