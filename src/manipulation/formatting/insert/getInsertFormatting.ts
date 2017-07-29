import * as ts from "typescript";
import {Node} from "./../../../compiler";
import * as errors from "./../../../errors";
import {Constructor} from "./../../../Constructor";
import {InsertFormatting} from "./InsertFormatting";
import {PropertyDeclarationInsertFormatting} from "./PropertyDeclarationInsertFormatting";
import {DecoratorInsertFormatting} from "./DecoratorInsertFormatting";

const formattingBySyntaxKind: { [name: number]: Constructor<InsertFormatting<Node, {}>>; } = {
    [ts.SyntaxKind.Decorator]: DecoratorInsertFormatting,
    [ts.SyntaxKind.PropertyDeclaration]: PropertyDeclarationInsertFormatting
};

export interface GetInsertFormattingOptions {
    parent: Node;
    index: number;
    children: Node[];
    structures: any[];
}

export function getInsertFormatting(kind: ts.SyntaxKind, opts: GetInsertFormattingOptions) {
    const formatting = formattingBySyntaxKind[kind];

    if (formatting == null)
        throw new errors.NotImplementedError(`Could not find formatting for ${ts.SyntaxKind[kind]}.`);

    return new formatting(
        opts.parent,
        opts.children,
        opts.children[opts.index - 1],
        opts.children[opts.index],
        opts.structures[0],
        opts.structures[opts.structures.length - 1]);
}
