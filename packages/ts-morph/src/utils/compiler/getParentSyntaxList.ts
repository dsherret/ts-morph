import { SyntaxKind, ts } from "@ts-morph/common";
import { ExtendedParser } from "../../compiler/ast/utils";

export function getParentSyntaxList(node: ts.Node, sourceFile: ts.SourceFile) {
  if (node.kind === SyntaxKind.EndOfFileToken)
    return undefined;

  const parent = node.parent;
  if (parent == null)
    return undefined;

  const { pos, end } = node;
  for (const child of ExtendedParser.getCompilerChildren(parent, sourceFile)) {
    if (child.pos > end || child === node)
      return undefined;

    if (child.kind === SyntaxKind.SyntaxList && child.pos <= pos && child.end >= end)
      return child as ts.SyntaxList;
  }

  return undefined; // shouldn't happen
}
