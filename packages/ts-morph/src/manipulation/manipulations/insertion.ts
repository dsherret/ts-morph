import { StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { Node, SourceFile } from "../../compiler";
import { Structure } from "../../structures";
import {
  appendCommaToText,
  getEndPosFromIndex,
  getInsertPosFromIndex,
  getNodesToReturn,
  getRangeWithoutCommentsFromArray,
  verifyAndGetIndex,
} from "../helpers";
import { NodeHandlerFactory } from "../nodeHandlers";
import { InsertionTextManipulator } from "../textManipulators";
import { doManipulation } from "./doManipulation";

export interface InsertIntoParentTextRangeOptions {
  insertPos: number;
  newText: string;
  parent: Node;
  replacing?: {
    textLength: number;
    nodes?: Node[];
  };
  customMappings?: (newParentNode: ts.Node, newSourceFile: ts.SourceFile) => { currentNode: Node; newNode: ts.Node }[];
}

/**
 * Inserts a text range into a parent.
 */
export function insertIntoParentTextRange(opts: InsertIntoParentTextRangeOptions) {
  const { insertPos, newText, parent } = opts;

  doManipulation(
    parent._sourceFile,
    new InsertionTextManipulator({
      insertPos,
      newText,
      replacingLength: opts.replacing?.textLength,
    }),
    new NodeHandlerFactory().getForParentRange({
      parent,
      start: insertPos,
      end: insertPos + newText.length,
      replacingLength: opts.replacing?.textLength,
      replacingNodes: opts.replacing?.nodes,
      customMappings: opts.customMappings,
    }),
  );
}

export interface InsertIntoTextRangeOptions {
  sourceFile: SourceFile;
  insertPos: number;
  newText: string;
}

/**
 * Inserts a text range into a source file.
 */
export function insertIntoTextRange(opts: InsertIntoTextRangeOptions) {
  const { insertPos, newText, sourceFile } = opts;

  doManipulation(
    sourceFile,
    new InsertionTextManipulator({
      insertPos,
      newText,
    }),
    new NodeHandlerFactory().getForRange({
      sourceFile,
      start: insertPos,
      end: insertPos + newText.length,
    }),
  );
}

export interface InsertIntoCommaSeparatedNodesOptions {
  currentNodes: Node[];
  insertIndex: number;
  newText: string;
  parent: Node;
  useTrailingCommas: boolean;
  useNewLines?: boolean;
  surroundWithSpaces?: boolean;
}

export function insertIntoCommaSeparatedNodes(opts: InsertIntoCommaSeparatedNodesOptions) {
  // todo: this function could use a bit of clean up
  const { currentNodes, insertIndex, parent } = opts;
  const previousNode = currentNodes[insertIndex - 1] as Node | undefined;
  const previousNonCommentNode = getPreviousNonCommentNode();
  if (previousNode != null && previousNonCommentNode != null && previousNode !== previousNonCommentNode) {
    const comma = getCommaAfterNode(previousNonCommentNode);
    // a comma after the comment can't be kept in place, so that uncommon case is rewritten below
    if (comma == null || comma.getStart() < previousNode.getEnd()) {
      insertAfterCommentNode(opts, previousNode, previousNonCommentNode, comma != null);
      return;
    }
  }

  const nextNode = currentNodes[insertIndex] as Node | undefined;
  const nextNonCommentNode = getNextNonCommentNode();
  const separator = opts.useNewLines ? parent._context.manipulationSettings.getNewLineKindAsString() : " ";
  const parentNextSibling = parent.getNextSibling();
  const isContained = parentNextSibling != null && (
    parentNextSibling.getKind() === SyntaxKind.CloseBraceToken || parentNextSibling.getKind() === SyntaxKind.CloseBracketToken
  );
  let { newText } = opts;
  let trailingCommentsEnd = previousNode?.getEnd() ?? 0;
  let endsWithLineComment = false;

  if (previousNode != null) {
    prependCommaAndSeparator();

    if (nextNonCommentNode != null || opts.useTrailingCommas)
      appendCommaAndSeparator();
    else if (opts.useNewLines || opts.surroundWithSpaces)
      appendSeparator();
    else
      appendIndentation();

    const nextStart = nextNode == null ? (isContained ? parentNextSibling!.getStart(true) : parent.getEnd()) : nextNode.getStart(true);
    const nextEndStart = Math.max(nextStart, trailingCommentsEnd);
    // keep any comments between the copied text and the next node, except
    // after a comment node where this range may hold the separating comma
    const keepsFollowingText = (previousNonCommentNode == null || previousNonCommentNode === previousNode)
      && parent.getSourceFile().getFullText().substring(trailingCommentsEnd, nextEndStart).trim().length > 0;
    if (keepsFollowingText)
      newText = newText.trimEnd();
    const insertPos = (previousNonCommentNode || previousNode).getEnd();
    insertIntoParentTextRange({
      insertPos,
      newText,
      parent,
      replacing: { textLength: (keepsFollowingText ? trailingCommentsEnd : nextEndStart) - insertPos },
    });
  } else if (nextNode != null) {
    if (opts.useNewLines || opts.surroundWithSpaces)
      prependSeparator();

    if (nextNonCommentNode != null || opts.useTrailingCommas)
      appendCommaAndSeparator();
    else
      appendSeparator();

    const insertPos = isContained ? parent.getPos() : parent.getStart(true);
    insertIntoParentTextRange({
      insertPos,
      newText,
      parent,
      replacing: { textLength: nextNode.getStart(true) - insertPos },
    });
  } else {
    if (opts.useNewLines || opts.surroundWithSpaces) {
      prependSeparator();

      if (opts.useTrailingCommas)
        appendCommaAndSeparator();
      else
        appendSeparator();
    } else {
      appendIndentation();
    }

    insertIntoParentTextRange({
      insertPos: parent.getPos(),
      newText,
      parent,
      replacing: { textLength: parent.getNextSiblingOrThrow().getStart() - parent.getPos() },
    });
  }

  function prependCommaAndSeparator() {
    if (previousNonCommentNode == null) {
      prependSeparator();
      return;
    }

    const originalSourceFileText = parent.getSourceFile().getFullText();
    const previousNodeNextSibling = previousNonCommentNode.getNextSibling();
    let text = "";
    if (previousNodeNextSibling != null && previousNodeNextSibling.getKind() === SyntaxKind.CommaToken) {
      if (previousNonCommentNode === previousNode)
        appendCommaWithSurroundingComments(previousNodeNextSibling);
      else {
        appendNodeTrailingCommentRanges(previousNonCommentNode);
        text += ",";
        appendCommentNodeTexts();
      }
    } else {
      text += ",";
      if (previousNonCommentNode === previousNode)
        appendNodeTrailingCommentRanges(previousNonCommentNode);
      else
        appendCommentNodeTexts();
    }

    if (endsWithLineComment && !opts.useNewLines && !StringUtils.startsWithNewLine(newText))
      newText = getNewLineWithChildIndentation() + newText;
    else
      prependSeparator();
    newText = text + newText;

    function appendCommaWithSurroundingComments(comma: Node) {
      const commentsBeforeComma = originalSourceFileText.substring(previousNonCommentNode!.getEnd(), comma.getStart()).trimEnd();
      const commentRangesBeforeComma = [...previousNonCommentNode!.getTrailingCommentRanges(), ...comma.getLeadingCommentRanges()];
      const lastCommentBeforeComma = commentRangesBeforeComma[commentRangesBeforeComma.length - 1];
      const commentRangesAfterComma = comma.getTrailingCommentRanges();
      const lastCommentAfterComma = commentRangesAfterComma[commentRangesAfterComma.length - 1];
      const commentsEnd = lastCommentAfterComma?.getEnd() ?? comma.getEnd();
      const commentsAfterComma = originalSourceFileText.substring(comma.getEnd(), commentsEnd);

      // a comma placed after a line comment would become part of the comment
      if (lastCommentBeforeComma?.getKind() === SyntaxKind.SingleLineCommentTrivia) {
        text += "," + commentsBeforeComma;
        if (commentsAfterComma.length > 0)
          text += getNewLineWithChildIndentation() + commentsAfterComma.trimStart();
      } else {
        text += commentsBeforeComma + "," + commentsAfterComma;
      }

      trailingCommentsEnd = commentsEnd;
      endsWithLineComment = (lastCommentAfterComma ?? lastCommentBeforeComma)?.getKind() === SyntaxKind.SingleLineCommentTrivia;
    }

    function getNewLineWithChildIndentation() {
      return parent._context.manipulationSettings.getNewLineKindAsString() + parent.getParentOrThrow().getChildIndentationText();
    }

    function appendCommentNodeTexts() {
      const lastCommentRangeEnd = getLastCommentRangeEnd(previousNode!) || previousNode!.getEnd();
      text += originalSourceFileText.substring(previousNonCommentNode!.getEnd(), lastCommentRangeEnd);
    }

    function appendNodeTrailingCommentRanges(node: Node) {
      const lastCommentRangeEnd = getLastCommentRangeEnd(node);
      if (lastCommentRangeEnd == null)
        return;
      text += originalSourceFileText.substring(node.getEnd(), lastCommentRangeEnd);
    }

    function getLastCommentRangeEnd(node: Node) {
      const commentRanges = node.getTrailingCommentRanges();
      const lastCommentRange = commentRanges[commentRanges.length - 1];
      if (lastCommentRange != null) {
        trailingCommentsEnd = lastCommentRange.getEnd();
        endsWithLineComment = lastCommentRange.getKind() === SyntaxKind.SingleLineCommentTrivia;
      }
      return lastCommentRange?.getEnd();
    }
  }

  function getPreviousNonCommentNode() {
    for (let i = insertIndex - 1; i >= 0; i--) {
      if (!Node.isCommentNode(currentNodes[i]))
        return currentNodes[i];
    }
    return undefined;
  }

  function getNextNonCommentNode() {
    for (let i = insertIndex; i < currentNodes.length; i++) {
      if (!Node.isCommentNode(currentNodes[i]))
        return currentNodes[i];
    }
    return undefined;
  }

  function prependSeparator() {
    if (!StringUtils.startsWithNewLine(newText))
      newText = separator + newText;
  }

  function appendCommaAndSeparator() {
    newText = appendCommaToText(newText);
    appendSeparator();
  }

  function appendSeparator() {
    if (!StringUtils.endsWithNewLine(newText))
      newText += separator;
    appendIndentation();
  }

  function appendIndentation() {
    if (opts.useNewLines || StringUtils.endsWithNewLine(newText)) {
      if (nextNode != null)
        newText += parent.getParentOrThrow().getChildIndentationText();
      else
        newText += parent.getParentOrThrow().getIndentationText();
    }
  }
}

export interface InsertIntoBracesOrSourceFileOptionsWriteInfo {
  previousMember: Node | undefined;
  nextMember: Node | undefined;
  isStartOfFile: boolean;
}

export interface InsertIntoBracesOrSourceFileOptions {
  parent: Node;
  children: Node[];
  index: number;
  write: (writer: CodeBlockWriter, info: InsertIntoBracesOrSourceFileOptionsWriteInfo) => void;
}

/**
 * Used to insert non-comma separated nodes into braces or a source file.
 */
export function insertIntoBracesOrSourceFile(opts: InsertIntoBracesOrSourceFileOptions) {
  const { parent, index, children } = opts;
  const fullText = parent._sourceFile.getFullText();
  const childSyntaxList = parent.getChildSyntaxListOrThrow();
  const insertPos = getInsertPosFromIndex(index, childSyntaxList, children);
  const endPos = getEndPosFromIndex(index, parent, children, fullText);
  const replacingLength = endPos - insertPos;
  const newText = getNewText();

  doManipulation(
    parent._sourceFile,
    new InsertionTextManipulator({ insertPos, replacingLength, newText }),
    new NodeHandlerFactory().getForParentRange({
      parent: childSyntaxList,
      start: insertPos,
      end: insertPos + newText.length,
      replacingLength,
    }),
  );

  function getNewText() {
    // todo: make this configurable
    const writer = parent._getWriterWithChildIndentation();
    opts.write(writer, {
      previousMember: getChild(children[index - 1]),
      nextMember: getChild(children[index]),
      isStartOfFile: insertPos === 0,
    });
    return writer.toString();

    function getChild(child: Node | undefined) {
      // ensure it passes the implementation
      if (child == null)
        return child;
      else if (Node.isOverloadable(child))
        return child.getImplementation() || child;
      else
        return child;
    }
  }
}

export interface InsertIntoBracesOrSourceFileWithGetChildrenOptions {
  getIndexedChildren: () => Node[];
  write: (writer: CodeBlockWriter, info: InsertIntoBracesOrSourceFileOptionsWriteInfo) => void;
  // for child functions
  expectedKind: SyntaxKind;
  structures: ReadonlyArray<Structure>;
  parent: Node;
  index: number;
}

/**
 * Glues together insertIntoBracesOrSourceFile and getRangeFromArray.
 * @param opts - Options to do this operation.
 */
export function insertIntoBracesOrSourceFileWithGetChildren<TNode extends Node>(
  opts: InsertIntoBracesOrSourceFileWithGetChildrenOptions,
) {
  if (opts.structures.length === 0)
    return [];

  const startChildren = opts.getIndexedChildren();
  const parentSyntaxList = opts.parent.getChildSyntaxListOrThrow();
  const index = verifyAndGetIndex(opts.index, startChildren.length);
  const previousJsDocCount = getPreviousJsDocCount(); // the inserting node will take ownership

  insertIntoBracesOrSourceFile({
    parent: opts.parent,
    index: getChildIndex(),
    children: parentSyntaxList.getChildren(),
    write: opts.write,
  });

  return getRangeWithoutCommentsFromArray<TNode>(opts.getIndexedChildren(), opts.index - previousJsDocCount, opts.structures.length, opts.expectedKind);

  function getChildIndex() {
    if (index === 0)
      return 0;

    // get the previous member in order to get the implementation signature + 1
    return startChildren[index - 1].getChildIndex() + 1;
  }

  function getPreviousJsDocCount() {
    let commentCount = 0;
    let count = 0;
    for (let i = index - 1; i >= 0; i--) {
      const node = startChildren[i];
      if (Node.isCommentNode(node)) {
        commentCount++;

        if (node.getText().startsWith("/**"))
          count = commentCount;
      } else {
        break;
      }
    }

    return count;
  }
}

export interface InsertIntoBracesOrSourceFileWithGetChildrenWithCommentsOptions {
  getIndexedChildren: () => Node[];
  write: (writer: CodeBlockWriter, info: InsertIntoBracesOrSourceFileOptionsWriteInfo) => void;
  parent: Node;
  index: number;
}

export function insertIntoBracesOrSourceFileWithGetChildrenWithComments(opts: InsertIntoBracesOrSourceFileWithGetChildrenWithCommentsOptions) {
  const startChildren = opts.getIndexedChildren();
  const parentSyntaxList = opts.parent.getChildSyntaxListOrThrow();
  const index = verifyAndGetIndex(opts.index, startChildren.length);

  insertIntoBracesOrSourceFile({
    parent: opts.parent,
    index: getChildIndex(),
    children: parentSyntaxList.getChildren(),
    write: opts.write,
  });

  return getNodesToReturn(startChildren, opts.getIndexedChildren(), index, true);

  function getChildIndex() {
    if (index === 0)
      return 0;

    // get the previous member in order to get the implementation signature + 1
    return startChildren[index - 1].getChildIndex() + 1;
  }
}

function insertAfterCommentNode(
  opts: InsertIntoCommaSeparatedNodesOptions,
  commentNode: Node,
  previousNonCommentNode: Node,
  hasComma: boolean,
) {
  const { currentNodes, insertIndex, parent } = opts;

  // add the comma first because the new text could otherwise parse as a continuation of the previous node (ex. `1\n[k]`)
  if (!hasComma)
    insertIntoParentTextRange({ insertPos: previousNonCommentNode.getEnd(), newText: ",", parent });

  const nextNode = currentNodes[insertIndex] as Node | undefined;
  const hasNextNonCommentNode = currentNodes.slice(insertIndex).some(node => !Node.isCommentNode(node));
  const newLine = parent._context.manipulationSettings.getNewLineKindAsString();
  const insertPos = getTrailingCommentsEnd(commentNode);
  const parentNextSibling = parent.getNextSibling();
  const followingStart = nextNode?.getStart(true) ?? parentNextSibling?.getStart(true) ?? parent.getEnd();
  const replaceEnd = Math.max(insertPos, followingStart);
  const keepsFollowingText = parent._sourceFile.getFullText().substring(insertPos, replaceEnd).trim().length > 0;

  let newText = opts.newText;
  if (!StringUtils.startsWithNewLine(newText))
    newText = newLine + newText;
  if (hasNextNonCommentNode || opts.useTrailingCommas)
    newText = appendCommaToText(newText);
  if (keepsFollowingText)
    newText = newText.trimEnd();
  else {
    if (!StringUtils.endsWithNewLine(newText))
      newText += newLine;
    newText += nextNode != null ? parent.getParentOrThrow().getChildIndentationText() : parent.getParentOrThrow().getIndentationText();
  }

  insertIntoParentTextRange({
    insertPos,
    newText,
    parent,
    replacing: { textLength: keepsFollowingText ? 0 : replaceEnd - insertPos },
  });
}

function getCommaAfterNode(node: Node) {
  const nextToken = node.getNextSiblings().find(sibling => !Node.isCommentNode(sibling));
  return nextToken?.getKind() === SyntaxKind.CommaToken ? nextToken : undefined;
}

function getTrailingCommentsEnd(node: Node) {
  const commentRanges = node.getTrailingCommentRanges();
  return commentRanges[commentRanges.length - 1]?.getEnd() ?? node.getEnd();
}
