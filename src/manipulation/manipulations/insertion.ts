import * as ts from "typescript";
import {Node, SourceFile} from "./../../compiler";
import {InsertionTextManipulator, InsertIntoBracesTextManipulator} from "./../textManipulators";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {doManipulation} from "./doManipulation";
import {verifyAndGetIndex, fillAndGetChildren, FillAndGetChildrenOptions} from "./../helpers";

export interface InsertIntoParentOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    childIndex: number;
    insertItemsCount: number;
    replacing?: {
        textLength: number;
        nodes?: Node[];
    };
    customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];
}

export function insertIntoParent(opts: InsertIntoParentOptions) {
    const {insertPos, newText, parent, childIndex, insertItemsCount, customMappings} = opts;

    doManipulation(parent.sourceFile, new InsertionTextManipulator({
        insertPos,
        newText,
        replacingLength: opts.replacing == null ? undefined : opts.replacing.textLength
    }), new NodeHandlerFactory().getForChildIndex({
        parent,
        childCount: insertItemsCount,
        childIndex,
        replacingNodes: opts.replacing == null ? undefined : opts.replacing.nodes,
        customMappings
    }));
}

export interface InsertSyntaxListOptions {
    insertPos: number;
    newText: string;
    parent: Node;
}

export function insertSyntaxList(opts: InsertSyntaxListOptions) {
    const {insertPos, newText, parent} = opts;

    doManipulation(parent.sourceFile,
        new InsertionTextManipulator({
            insertPos,
            newText
        }), new NodeHandlerFactory().getForCreatingSyntaxList({
            parent,
            insertPos
        }));
}

export interface InsertIntoParentTextRangeOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    replacing?: {
        textLength: number;
    };
}

/**
 * Inserts a text range into a parent.
 */
export function insertIntoParentTextRange(opts: InsertIntoParentTextRangeOptions) {
    const {insertPos, newText, parent} = opts;

    doManipulation(parent.sourceFile,
        new InsertionTextManipulator({
            insertPos,
            newText,
            replacingLength: opts.replacing == null ? undefined : opts.replacing.textLength
        }), new NodeHandlerFactory().getForRange({
            parent,
            start: insertPos,
            end: insertPos + newText.length,
            replacingLength: opts.replacing == null ? undefined : opts.replacing.textLength
        }));
}

export interface InsertIntoCreatableSyntaxListOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    syntaxList: Node | undefined;
    childIndex: number;
    insertItemsCount: number;
}

export function insertIntoCreatableSyntaxList(opts: InsertIntoCreatableSyntaxListOptions) {
    const {insertPos, newText, parent, syntaxList, childIndex, insertItemsCount} = opts;

    if (syntaxList == null)
        insertSyntaxList({
            parent,
            insertPos,
            newText
        });
    else
        insertIntoParent({
            insertPos,
            newText,
            parent: syntaxList,
            insertItemsCount,
            childIndex
        });
}

export interface InsertIntoCommaSeparatedNodesOptions {
    currentNodes: Node[];
    insertIndex: number;
    newTexts: string[];
    parent: Node;
    useNewLines?: boolean;
}

export function insertIntoCommaSeparatedNodes(opts: InsertIntoCommaSeparatedNodesOptions) {
    // todo: this needs to be fixed/cleaned up in the future, but this is good enough for now
    const {currentNodes, insertIndex, newTexts, parent} = opts;
    const nextNode = currentNodes[insertIndex];
    const previousNode = currentNodes[insertIndex - 1];
    const numberOfSyntaxListItemsInserting = newTexts.length * 2 - 1;
    const separator = opts.useNewLines ? parent.global.manipulationSettings.getNewLineKind() : " ";
    const childIndentationText = parent.getParentOrThrow().getChildIndentationText();
    const parentNextSibling = parent.getNextSibling();
    const isContained = parentNextSibling != null && (
        parentNextSibling.getKind() === ts.SyntaxKind.CloseBraceToken || parentNextSibling.getKind() === ts.SyntaxKind.CloseBracketToken
    );
    let newText = newTexts.join(`,${separator}`);

    if (previousNode != null) {
        const nextEndStart = nextNode == null ? (isContained ? parentNextSibling!.getStart(true) : parent.getEnd()) : nextNode.getStart(true);
        const insertPos = previousNode.getEnd();

        newText = `,${separator}${newText}`;
        if (nextNode != null) {
            newText += `,${separator}`;
            if (opts.useNewLines)
                newText += childIndentationText;
        }
        else if (opts.useNewLines)
            newText += separator + parent.getParentOrThrow().getIndentationText();

        insertIntoParentTextRange({
            insertPos,
            newText,
            parent,
            replacing: { textLength: nextEndStart - insertPos }
        });
    }
    else if (nextNode != null) {
        if (opts.useNewLines)
            newText = separator + newText;
        newText += `,${separator}`;
        if (opts.useNewLines)
            newText += childIndentationText;
        const insertPos = isContained ? parent.getPos() : parent.getStart(true);
        insertIntoParentTextRange({
            insertPos,
            newText,
            parent,
            replacing: { textLength: nextNode.getStart(true) - insertPos }
        });
    }
    else {
        if (opts.useNewLines)
            newText = separator + newText + parent.global.manipulationSettings.getNewLineKind() + parent.getIndentationText();

        insertIntoParentTextRange({
            insertPos: parent.getPos(),
            newText,
            parent,
            replacing: { textLength: parent.getNextSiblingOrThrow().getStart() - parent.getPos() }
        });
    }
}

export interface InsertIntoBracesOrSourceFileOptions<TStructure> {
    parent: Node;
    children: Node[];
    index: number;
    childCodes: string[];
    separator: string;
    structures?: TStructure[];
    previousBlanklineWhen?: (previousMember: Node, firstStructure: TStructure) => boolean;
    nextBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean;
    separatorNewlineWhen?: (previousStructure: TStructure, nextStructure: TStructure) => boolean;
}

/**
 * Used to insert non-comma separated nodes into braces or a source file.
 */
export function insertIntoBracesOrSourceFile<TStructure = {}>(opts: InsertIntoBracesOrSourceFileOptions<TStructure>) {
    const {parent, index, childCodes, separator, children} = opts;

    doManipulation(parent.sourceFile, new InsertIntoBracesTextManipulator(opts), new NodeHandlerFactory().getForChildIndex({
        parent: parent.getChildSyntaxListOrThrow(),
        childIndex: index,
        childCount: childCodes.length
    }));
}

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
