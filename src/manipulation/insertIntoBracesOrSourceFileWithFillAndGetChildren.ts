import * as ts from "typescript";
import {Node, SourceFile, LanguageService} from "./../compiler";
import {verifyAndGetIndex} from "./verifyAndGetIndex";
import {getEndIndexFromArray} from "./getEndIndexFromArray";
import {insertIntoBracesOrSourceFile, InsertIntoBracesOrSourceFileOptions} from "./insertIntoBracesOrSourceFile";
import {fillAndGetChildren, FillAndGetChildrenOptions} from "./fillAndGetChildren";

export interface InsertIntoBracesOrSourceFileWithFillAndGetChildrenOptions<TNode extends Node, TStructure> {
    getChildren: () => Node[];
    // for child functions
    sourceFile: SourceFile;
    expectedKind: ts.SyntaxKind;
    structures: TStructure[];
    fillFunction?: (child: TNode, structure: TStructure) => void;
    parent: Node;
    index: number;
    childCodes: string[];
    previousBlanklineWhen?: (previousMember: Node, firstStructure: TStructure) => boolean;
    nextBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean;
    separatorNewlineWhen?: (previousStructure: TStructure, nextStructure: TStructure) => boolean;
}

/**
 * Glues together insertIntoBracesOrSourceFile and fillAndGetChildren.
 * @param opts - Options to do this operation.
 */
export function insertIntoBracesOrSourceFileWithFillAndGetChildren<TNode extends Node, TStructure>(
    opts: InsertIntoBracesOrSourceFileWithFillAndGetChildrenOptions<TNode, TStructure>
) {
    if (opts.structures.length === 0)
        return [];

    const languageService = opts.sourceFile.factory.getLanguageService();
    const startChildren = opts.getChildren();
    const index =  verifyAndGetIndex(opts.index, startChildren.length);

    insertIntoBracesOrSourceFile({
        ...opts,
        children: startChildren,
        languageService,
        separator: languageService.getNewLine(),
        index
    } as InsertIntoBracesOrSourceFileOptions<TStructure>);

    return fillAndGetChildren<TNode, TStructure>({
        ...opts,
        allChildren: opts.getChildren(),
        index
    } as FillAndGetChildrenOptions<TNode, TStructure>);
}
