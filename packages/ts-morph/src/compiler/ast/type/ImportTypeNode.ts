import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange } from "../../../manipulation";
import { EntityName } from "../aliases";
import { Node } from "../common";
import { NodeWithTypeArguments, TypeNode } from "./TypeNode";

export class ImportTypeNode extends NodeWithTypeArguments<ts.ImportTypeNode> {
  /**
   * Sets the argument text.
   * @param text - Text of the argument.
   */
  setArgument(text: string) {
    const arg = this.getArgument();
    if (Node.isLiteralTypeNode(arg)) {
      const literal = arg.getLiteral();
      if (Node.isStringLiteral(literal)) {
        literal.setLiteralValue(text);
        return this;
      }
    }

    arg.replaceWithText(writer => writer.quote(text), this._getWriterWithQueuedChildIndentation());
    return this;
  }

  /**
   * Gets the argument passed into the import type.
   */
  getArgument(): TypeNode {
    return this._getNodeFromCompilerNode(this.compilerNode.argument);
  }

  /**
   * Sets the qualifier text.
   * @param text - Text.
   */
  setQualifier(text: string) {
    const qualifier = this.getQualifier();

    if (qualifier != null)
      qualifier.replaceWithText(text, this._getWriterWithQueuedChildIndentation());
    else {
      const paren = this.getFirstChildByKindOrThrow(SyntaxKind.CloseParenToken);
      insertIntoParentTextRange({
        insertPos: paren.getEnd(),
        parent: this,
        newText: this._getWriterWithQueuedIndentation().write(".").write(text).toString(),
      });
    }

    return this;
  }

  /**
   * Gets the qualifier of the import type if it exists or throws
   */
  getQualifierOrThrow(message?: string | (() => string)): EntityName {
    return errors.throwIfNullOrUndefined(this.getQualifier(), () => message || `Expected to find a qualifier for the import type: ${this.getText()}`, this);
  }

  /**
   * Gets the qualifier of the import type if it exists or returns undefined.
   */
  getQualifier(): EntityName | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.qualifier);
  }

  /** Gets the import type assertion container if it exists. */
  getAssertions() {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.assertions);
  }

  /** Gets the import type assertion container if it exists or throws. */
  getAssertionsOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this._getNodeFromCompilerNodeIfExists(this.compilerNode.assertions),
      message || "Could not find import type assertion container.", this,
    );
  }
}
