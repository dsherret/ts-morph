import * as ts from "typescript";
import {Node} from "./../compiler";
import * as errors from "./../errors";
import {Formatting} from "./formatting/Formatting";
import {PropertyDeclarationFormatting} from "./formatting/PropertyDeclarationFormatting";
import {DecoratorFormatting} from "./formatting/DecoratorFormatting";
import {Constructor} from "./../Constructor";

const formattingBySyntaxKind: { [name: number]: Constructor<Formatting<Node, {}>>; } = {
    [ts.SyntaxKind.Decorator]: DecoratorFormatting,
    [ts.SyntaxKind.PropertyDeclaration]: PropertyDeclarationFormatting
};

export interface GetFormattingBySyntaxKindOptions {
    parent: Node;
    previousMember: Node | undefined;
    nextMember: Node | undefined;
    firstStructure: any;
    lastStructure: any;
}

export function getFormattingBySyntaxKind(kind: ts.SyntaxKind, opts: GetFormattingBySyntaxKindOptions) {
    const formatting = formattingBySyntaxKind[kind];

    if (formatting == null)
        throw new errors.NotImplementedError(`Could not find formatting for ${ts.SyntaxKind[kind]}.`);

    return new formatting(opts.parent, opts.previousMember, opts.nextMember, opts.firstStructure, opts.lastStructure);
}
