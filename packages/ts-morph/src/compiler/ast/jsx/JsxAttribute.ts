import { errors, nameof, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { JsxAttributeSpecificStructure, JsxAttributeStructure, StructureKind } from "../../../structures";
import { WriterFunction } from "../../../types";
import { getTextFromStringOrWriter } from "../../../utils";
import { NamedNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { StringLiteral } from "../literal";
import { JsxElement } from "./JsxElement";
import { JsxExpression } from "./JsxExpression";
import { JsxFragment } from "./JsxFragment";
import { JsxSelfClosingElement } from "./JsxSelfClosingElement";

export const JsxAttributeBase = NamedNode(Node);
export class JsxAttribute extends JsxAttributeBase<ts.JsxAttribute> {
  /**
   * Gets the JSX attribute's initializer or throws if it doesn't exist.
   */
  getInitializerOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getInitializer(), message || `Expected to find an initializer for the JSX attribute '${this.getName()}'`, this);
  }

  /**
   * Gets the JSX attribute's initializer or returns undefined if it doesn't exist.
   */
  getInitializer(): JsxElement | JsxExpression | JsxFragment | JsxSelfClosingElement | StringLiteral | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.initializer);
  }

  /**
   * Sets the initializer.
   * @param textOrWriterFunction - Text or writer function to set the initializer with.
   * @remarks You need to provide the quotes or braces.
   */
  setInitializer(textOrWriterFunction: string | WriterFunction) {
    const text = getTextFromStringOrWriter(this._getWriterWithQueuedIndentation(), textOrWriterFunction);

    if (StringUtils.isNullOrWhitespace(text)) {
      this.removeInitializer();
      return this;
    }

    const initializer = this.getInitializer();
    if (initializer != null) {
      initializer.replaceWithText(text);
      return this;
    }

    insertIntoParentTextRange({
      insertPos: this.getNameNode().getEnd(),
      parent: this,
      newText: `=${text}`,
    });

    return this;
  }

  /**
   * Removes the initializer.
   */
  removeInitializer() {
    const initializer = this.getInitializer();
    if (initializer == null)
      return this;

    removeChildren({
      children: [initializer.getPreviousSiblingIfKindOrThrow(SyntaxKind.EqualsToken), initializer],
      removePrecedingSpaces: true,
      removePrecedingNewLines: true,
    });

    return this;
  }

  /**
   * Removes the JSX attribute.
   */
  remove() {
    removeChildren({
      children: [this],
      removePrecedingNewLines: true,
      removePrecedingSpaces: true,
    });
  }

  /**
   * Sets the node from a structure.
   * @param structure - Structure to set the node with.
   */
  set(structure: Partial<JsxAttributeStructure>) {
    callBaseSet(JsxAttributeBase.prototype, this, structure);

    if (structure.initializer != null)
      this.setInitializer(structure.initializer);
    else if (structure.hasOwnProperty(nameof(structure, "initializer")))
      this.removeInitializer();

    return this;
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): JsxAttributeStructure {
    const initializer = this.getInitializer();
    return callBaseGetStructure<JsxAttributeSpecificStructure>(JsxAttributeBase.prototype, this, {
      kind: StructureKind.JsxAttribute,
      initializer: initializer?.getText(),
    });
  }
}
