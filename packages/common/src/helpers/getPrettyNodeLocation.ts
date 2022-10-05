import type { StandardizedFilePath } from "../fileSystem";

/**
 * Minimal attributes to show a error message with source
 * (ts.Node from ts-morph)
 */
export type TracableNode = {
  getSourceFile: () => {
    getFilePath: () => StandardizedFilePath;
    getFullText: () => string;
  }
  getPos(): number;
}

/**
 * Returns the line of the given node inside its source file
 * in a prettified format.
 */
export const getPrettyNodeLocation = (node: TracableNode) => {
  const source = getSourceLocation(node);
  if (!source) {
    return;
  }
  const linePrefix = `> ${source.loc.line + 1} |`;
  return `${source.fileName}:${source.loc.line + 1}:${source.loc.character + 1}\n\n${linePrefix}${source.brokenLine}\n${" ".repeat(linePrefix.length - 1)}|${" ".repeat(source.loc.character)}^`;
}

/**
 * Prints prettified string of the nodes location
 */
export const printPrettyNodeLocation = (node: TracableNode) => {
  console.log(getPrettyNodeLocation(node) || node);
}

/**
 * Returns the location of the given node inside its source file.
 */
export const getSourceLocation = (node: TracableNode) => {
  if (!isTracableNode(node)) {
    return;
  }
  const sourceFile = node.getSourceFile();
  const sourceCode = sourceFile.getFullText();
  const pos = node.getPos();
  const textBeforePos = sourceCode.substring(0, pos);
  const line = textBeforePos.match(/\n/g)?.length || 0;
  const brokenLineStart = textBeforePos.lastIndexOf("\n", pos);
  const brokenLineEnd = sourceCode.indexOf("\n", pos);
  const brokenLine = sourceCode.substring(brokenLineStart + 1, brokenLineEnd === -1 ? undefined : brokenLineEnd);
  return { fileName: sourceFile.getFilePath(), loc: { line, character: pos - brokenLineStart }, brokenLine, pos };
}

const isTracableNode = (node: unknown): node is TracableNode =>
  typeof node === "object" && node !== null && ("getSourceFile" in node) && ("getPos" in node);
