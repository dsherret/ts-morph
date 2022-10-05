import { errors, nameof, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren, removeCommaSeparatedChild } from "../../../manipulation";
import { StructureKind, TypeParameterDeclarationSpecificStructure, TypeParameterDeclarationStructure } from "../../../structures";
import { WriterFunction } from "../../../types";
import { ModifierableNode, NamedNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { TypeNode } from "./TypeNode";

/** Variance of the type parameter. */
export enum TypeParameterVariance {
  /** Variance is not specified. */
  None = 0,
  /** Contravariant. */
  In = 1 << 0,
  /** Covariant. */
  Out = 1 << 1,
  /** Invariant. */
  InOut = In | Out,
}

export const TypeParameterDeclarationBase = ModifierableNode(NamedNode(Node));
export class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
  /**
   * Gets the constraint of the type parameter.
   */
  getConstraint(): TypeNode | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.constraint);
  }

  /**
   * Gets the constraint of the type parameter or throws if it doesn't exist.
   */
  getConstraintOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getConstraint(), message || "Expected to find the type parameter's constraint.", this);
  }

  /**
   * Sets the type parameter constraint.
   * @param text - Text to set as the constraint.
   */
  setConstraint(text: string | WriterFunction) {
    text = this.getParentOrThrow()._getTextWithQueuedChildIndentation(text);
    if (StringUtils.isNullOrWhitespace(text)) {
      this.removeConstraint();
      return this;
    }

    const constraint = this.getConstraint();
    if (constraint != null) {
      constraint.replaceWithText(text);
      return this;
    }

    const nameNode = this.getNameNode();
    insertIntoParentTextRange({
      parent: this,
      insertPos: nameNode.getEnd(),
      newText: ` extends ${text}`,
    });

    return this;
  }

  /**
   * Removes the constraint type node.
   */
  removeConstraint() {
    removeConstraintOrDefault(this.getConstraint(), SyntaxKind.ExtendsKeyword);
    return this;
  }

  /**
   * Gets the default node of the type parameter.
   */
  getDefault(): TypeNode | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.default);
  }

  /**
   * Gets the default node of the type parameter or throws if it doesn't exist.
   */
  getDefaultOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getDefault(), message || "Expected to find the type parameter's default.", this);
  }

  /**
   * Sets the type parameter default type node.
   * @param text - Text to set as the default type node.
   */
  setDefault(text: string | WriterFunction) {
    text = this.getParentOrThrow()._getTextWithQueuedChildIndentation(text);
    if (StringUtils.isNullOrWhitespace(text)) {
      this.removeDefault();
      return this;
    }

    const defaultNode = this.getDefault();
    if (defaultNode != null) {
      defaultNode.replaceWithText(text);
      return this;
    }

    const insertAfterNode = this.getConstraint() || this.getNameNode();
    insertIntoParentTextRange({
      parent: this,
      insertPos: insertAfterNode.getEnd(),
      newText: ` = ${text}`,
    });

    return this;
  }

  /**
   * Removes the default type node.
   */
  removeDefault() {
    removeConstraintOrDefault(this.getDefault(), SyntaxKind.EqualsToken);
    return this;
  }

  /** Set the variance of the type parameter. */
  setVariance(variance: TypeParameterVariance) {
    this.toggleModifier("in", (variance & TypeParameterVariance.In) !== 0);
    this.toggleModifier("out", (variance & TypeParameterVariance.Out) !== 0);
    return this;
  }

  /** Gets the variance of the type parameter. */
  getVariance() {
    let variance = TypeParameterVariance.None;
    if (this.hasModifier("in"))
      variance |= TypeParameterVariance.In;
    if (this.hasModifier("out"))
      variance |= TypeParameterVariance.Out;
    return variance;
  }

  /**
   * Removes this type parameter.
   */
  remove() {
    const parentSyntaxList = this.getParentSyntaxListOrThrow();
    const typeParameters = parentSyntaxList.getChildrenOfKind(SyntaxKind.TypeParameter);

    if (typeParameters.length === 1)
      removeAllTypeParameters();
    else
      removeCommaSeparatedChild(this);

    function removeAllTypeParameters() {
      const children = [
        parentSyntaxList.getPreviousSiblingIfKindOrThrow(SyntaxKind.LessThanToken),
        parentSyntaxList,
        parentSyntaxList.getNextSiblingIfKindOrThrow(SyntaxKind.GreaterThanToken),
      ];

      removeChildren({ children });
    }
  }

  /**
   * Sets the node from a structure.
   * @param structure - Structure to set the node with.
   */
  set(structure: Partial<TypeParameterDeclarationStructure>) {
    callBaseSet(TypeParameterDeclarationBase.prototype, this, structure);

    if (structure.constraint != null)
      this.setConstraint(structure.constraint);
    else if (structure.hasOwnProperty(nameof(structure, "constraint")))
      this.removeConstraint();

    if (structure.default != null)
      this.setDefault(structure.default);
    else if (structure.hasOwnProperty(nameof(structure, "default")))
      this.removeDefault();

    if (structure.variance != null)
      this.setVariance(structure.variance);

    return this;
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): TypeParameterDeclarationStructure {
    const constraintNode = this.getConstraint();
    const defaultNode = this.getDefault();

    return callBaseGetStructure<TypeParameterDeclarationSpecificStructure>(TypeParameterDeclarationBase.prototype, this, {
      kind: StructureKind.TypeParameter,
      constraint: constraintNode != null ? constraintNode.getText({ trimLeadingIndentation: true }) : undefined,
      default: defaultNode ? defaultNode.getText({ trimLeadingIndentation: true }) : undefined,
      variance: this.getVariance(),
    });
  }
}

function removeConstraintOrDefault(nodeToRemove: Node | undefined, siblingKind: SyntaxKind) {
  if (nodeToRemove == null)
    return;

  removeChildren({
    children: [nodeToRemove.getPreviousSiblingIfKindOrThrow(siblingKind), nodeToRemove],
    removePrecedingSpaces: true,
  });
}
