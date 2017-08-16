import * as ts from "typescript";
import {Node, SourceFile, LanguageService} from "./../../compiler";
import {verifyAndGetIndex} from "./../verifyAndGetIndex";
import {getEndIndexFromArray} from "./../getEndIndexFromArray";
import {fillAndGetChildren, FillAndGetChildrenOptions} from "./../fillAndGetChildren";
import {insertIntoBracesOrSourceFile, InsertIntoBracesOrSourceFileOptions} from "./insertIntoBracesOrSourceFile";

export interface InsertIntoBracesOrSourceFileWithFillAndGetChildrenOptions<TNode extends Node, TStructure> {
    getIndexedChildren: () => Node[];
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

    const startChildren = opts.getIndexedChildren();
    const parentSyntaxList = opts.parent.getChildSyntaxListOrThrow();
    const index = verifyAndGetIndex(opts.index, startChildren.length);
    const childIndex = getChildIndex();

    insertIntoBracesOrSourceFile({
        ...opts,
        children: parentSyntaxList.getChildren(),
        separator: opts.sourceFile.global.manipulationSettings.getNewLineKind(),
        index: childIndex
    } as InsertIntoBracesOrSourceFileOptions<TStructure>);

    return fillAndGetChildren<TNode, TStructure>({
        ...opts,
        allChildren: opts.getIndexedChildren(),
        index
    } as FillAndGetChildrenOptions<TNode, TStructure>);

    function getChildIndex() {
        if (index === 0)
            return 0;

        // get the previous member in order to get the implementation signature + 1
        return startChildren[index - 1].getChildIndex() + 1;
    }
}
