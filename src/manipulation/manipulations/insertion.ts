import CodeBlockWriter from "code-block-writer";
import { ts, SyntaxKind } from "../../typescript";
import {Node, SourceFile} from "../../compiler";
import {StringUtils, TypeGuards} from "../../utils";
import {InsertionTextManipulator} from "../textManipulators";
import {isBlankLineAtPos} from "../textChecks";
import {NodeHandlerFactory} from "../nodeHandlers";
import {doManipulation} from "./doManipulation";
import {verifyAndGetIndex, fillAndGetChildren, FillAndGetChildrenOptions, getInsertPosFromIndex, getEndPosFromIndex} from "../helpers";

export interface InsertIntoParentTextRangeOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    replacing?: {
        textLength: number;
        nodes?: Node[];
    };
    customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];
}

/**
 * Inserts a text range into a parent.
 */
export function insertIntoParentTextRange(opts: InsertIntoParentTextRangeOptions) {
    const {insertPos, newText, parent} = opts;

    // todo: this should only forget the existing node if the kind changes
    doManipulation(parent.sourceFile,
        new InsertionTextManipulator({
            insertPos,
            newText,
            replacingLength: opts.replacing == null ? undefined : opts.replacing.textLength
        }), new NodeHandlerFactory().getForRange({
            parent,
            start: insertPos,
            end: insertPos + newText.length,
            replacingLength: opts.replacing == null ? undefined : opts.replacing.textLength,
            replacingNodes: opts.replacing == null ? undefined : opts.replacing.nodes,
            customMappings: opts.customMappings
        }));
}

export interface InsertIntoCommaSeparatedNodesOptions {
    currentNodes: Node[];
    insertIndex: number;
    newText: string;
    parent: Node;
    useNewLines?: boolean;
    surroundWithSpaces?: boolean;
}

export function insertIntoCommaSeparatedNodes(opts: InsertIntoCommaSeparatedNodesOptions) {
    // todo: this needs to be fixed/cleaned up in the future, but this is good enough for now
    const {currentNodes, insertIndex, parent} = opts;
    const nextNode = currentNodes[insertIndex];
    const previousNode = currentNodes[insertIndex - 1];
    const separator = opts.useNewLines ? parent.global.manipulationSettings.getNewLineKindAsString() : " ";
    const childIndentationText = parent.getParentOrThrow().getChildIndentationText();
    const parentNextSibling = parent.getNextSibling();
    const isContained = parentNextSibling != null && (
        parentNextSibling.getKind() === SyntaxKind.CloseBraceToken || parentNextSibling.getKind() === SyntaxKind.CloseBracketToken
    );
    let {newText} = opts;

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
        else if (opts.surroundWithSpaces)
            newText += " ";

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
        else if (opts.surroundWithSpaces)
            newText = " " + newText;
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
            newText = separator + newText + parent.global.manipulationSettings.getNewLineKindAsString() + parent.getParentOrThrow().getIndentationText();
        else if (opts.surroundWithSpaces)
            newText = ` ${newText} `;

        insertIntoParentTextRange({
            insertPos: parent.getPos(),
            newText,
            parent,
            replacing: { textLength: parent.getNextSiblingOrThrow().getStart() - parent.getPos() }
        });
    }
}

export interface InsertIntoBracesOrSourceFileOptionsNew<TStructure> {
    parent: Node;
    children: Node[];
    index: number;
    write: (writer: CodeBlockWriter, info: { previousMember: Node | undefined; nextMember: Node | undefined; }) => void;
}

/**
 * Used to insert non-comma separated nodes into braces or a source file.
 */
export function insertIntoBracesOrSourceFile<TStructure = {}>(opts: InsertIntoBracesOrSourceFileOptionsNew<TStructure>) {
    const {parent, index, children} = opts;
    const fullText = parent.sourceFile.getFullText();
    const insertPos = getInsertPosFromIndex(index, parent, children);
    const endPos = getEndPosFromIndex(index, parent, children, fullText);
    const replacingLength = endPos - insertPos;
    const newText = getNewText();

    doManipulation(parent.sourceFile, new InsertionTextManipulator({ insertPos, replacingLength, newText }), new NodeHandlerFactory().getForRange({
        parent: parent.getChildSyntaxListOrThrow(),
        start: insertPos,
        end: insertPos + newText.length,
        replacingLength
    }));

    function getNewText() {
        // todo: make this configurable
        const writer = parent.getWriterWithChildIndentation();
        opts.write(writer, { previousMember: getChild(children[index - 1]), nextMember: getChild(children[index]) });
        return writer.toString();

        function getChild(child: Node | undefined) {
            // ensure it passes the implementation
            if (child == null)
                return child;
            else if (TypeGuards.isOverloadableNode(child))
                return child.getImplementation() || child;
            else
                return child;
        }
    }
}

export interface InsertIntoBracesOrSourceFileWithFillAndGetChildrenOptions<TNode extends Node, TStructure> {
    getIndexedChildren: () => Node[];
    write: (writer: CodeBlockWriter, info: { previousMember: Node | undefined; nextMember: Node | undefined; }) => void;
    // for child functions
    expectedKind: SyntaxKind;
    structures: TStructure[];
    fillFunction?: (child: TNode, structure: TStructure) => void;
    parent: Node;
    index: number;
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
        parent: opts.parent,
        index: getChildIndex(),
        children: parentSyntaxList.getChildren(),
        write: opts.write
    });

    return fillAndGetChildren<TNode, TStructure>({
        sourceFile: opts.parent.sourceFile,
        allChildren: opts.getIndexedChildren(),
        index,
        structures: opts.structures,
        expectedKind: opts.expectedKind,
        fillFunction: opts.fillFunction
    });

    function getChildIndex() {
        if (index === 0)
            return 0;

        // get the previous member in order to get the implementation signature + 1
        return startChildren[index - 1].getChildIndex() + 1;
    }
}

export interface InsertIntoBracesOrSourceFileOptionsOld<TStructure> {
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
export function insertIntoBracesOrSourceFileOld<TStructure = {}>(opts: InsertIntoBracesOrSourceFileOptionsOld<TStructure>) {
    // todo: REMOVE
    if (opts.childCodes.length === 0)
        return;

    const {parent, index, childCodes, separator, children} = opts;
    const insertPos = getInsertPosFromIndex(index, parent, children);

    doManipulation(parent.sourceFile, new InsertionTextManipulator({ insertPos, newText: getNewText() }), new NodeHandlerFactory().getForChildIndex({
        parent: parent.getChildSyntaxListOrThrow(),
        childIndex: index,
        childCount: childCodes.length
    }));

    function getNewText() {
        const sourceFile = parent.getSourceFile();
        const newLineChar = sourceFile.global.manipulationSettings.getNewLineKindAsString();

        let newText = "";

        for (let i = 0; i < childCodes.length; i++) {
            if (i > 0) {
                newText += separator;
                if (opts.separatorNewlineWhen != null && opts.separatorNewlineWhen(opts.structures![i - 1], opts.structures![i]))
                    newText += newLineChar;
            }
            newText += childCodes[i];
        }

        if (index !== 0)
            newText = separator + newText;
        else if (insertPos !== 0)
            newText = newLineChar + newText;
        else if (parent.getFullWidth() > 0)
            newText = newText + separator;

        if (opts.previousBlanklineWhen != null) {
            const previousMember: Node | undefined = children[index - 1];
            const firstStructure = opts.structures![0];
            if (previousMember != null && opts.previousBlanklineWhen(previousMember, firstStructure))
                newText = newLineChar + newText;
        }

        const nextMember: Node | undefined = children[index];
        if (opts.nextBlanklineWhen != null) {
            const lastStructure = opts.structures![opts.structures!.length - 1];
            if (nextMember != null && opts.nextBlanklineWhen(nextMember, lastStructure)) {
                if (!isBlankLineAtPos(sourceFile, insertPos))
                    newText = newText + newLineChar;
            }
        }

        if (TypeGuards.isSourceFile(parent) && nextMember == null && !StringUtils.endsWith(newText, newLineChar) && !StringUtils.endsWith(sourceFile.getFullText(), "\n"))
            newText = newText + newLineChar;

        return newText;
    }
}
