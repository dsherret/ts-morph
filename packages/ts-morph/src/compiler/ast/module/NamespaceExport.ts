import { ts } from "@ts-morph/common";
import { isValidVariableName } from "../../../utils";
import { RenameableNode } from "../base";
import { Node } from "../common";
import { StringLiteral } from "../literal";

export const NamespaceExportBase = RenameableNode(Node);
export class NamespaceExport extends NamespaceExportBase<ts.NamespaceExport> {
  /**
   * Sets the name of the namespace export.
   */
  setName(name: string) {
    const nameNode = this.getNameNode();
    if (this.getName() === name)
      return this;

    if (isValidVariableName(name))
      nameNode.replaceWithText(name);
    else
      nameNode.replaceWithText(`"${name.replaceAll("\"", "\\\"")}"`);
    return this;
  }

  /**
   * Gets the name of the namespace export.
   */
  getName() {
    const nameNode = this.getNameNode();
    if (nameNode.getKind() === ts.SyntaxKind.StringLiteral)
      return (nameNode as StringLiteral).getLiteralText();
    else
      return nameNode.getText();
  }

  /**
   * Gets the namespace export's name node.
   */
  getNameNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.name);
  }
}
