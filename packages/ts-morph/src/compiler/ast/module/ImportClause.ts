import { errors, ImportPhaseModifierSyntaxKind, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { Node } from "../common";

export const ImportClauseBase = Node;
export class ImportClause extends ImportClauseBase<ts.ImportClause> {
  /** Gets the phase modifier of the import clause. */
  getPhaseModifier(): ImportPhaseModifierSyntaxKind | undefined {
    return this.compilerNode.phaseModifier;
  }

  /** Gets if this import clause is type only. */
  isTypeOnly() {
    return this.compilerNode.phaseModifier === SyntaxKind.TypeKeyword;
  }

  /** Sets if this import declaration is type only. */
  setIsTypeOnly(value: boolean) {
    if (this.isTypeOnly() === value)
      return this;

    if (value) {
      insertIntoParentTextRange({
        parent: this,
        insertPos: this.getStart(),
        newText: "type ",
      });
    } else {
      const typeKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.TypeKeyword);
      removeChildren({
        children: [typeKeyword],
        removeFollowingSpaces: true,
      });
    }

    return this;
  }

  /** Gets if this import clause has a defer phase modifier. */
  isDeferred() {
    return this.compilerNode.phaseModifier === SyntaxKind.DeferKeyword;
  }

  /**
   * Sets if this import declaration should have a defer keyword.
   * @throws When not a namespace import.
   */
  setIsDeferred(value: boolean) {
    if (this.isDeferred() === value)
      return this;

    if (value) {
      if (this.getNamespaceImport() == null)
        throw new Error("Cannot set an import as deferred when not a namespace import.");

      insertIntoParentTextRange({
        parent: this,
        insertPos: this.getStart(),
        newText: "defer ",
      });
    } else {
      const deferKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.DeferKeyword);
      removeChildren({
        children: [deferKeyword],
        removeFollowingSpaces: true,
      });
    }

    return this;
  }

  /**
   * Gets the default import or throws if it doesn't exit.
   */
  getDefaultImportOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getDefaultImport(), message ?? "Expected to find a default import.", this);
  }

  /**
   * Gets the default import or returns undefined if it doesn't exist.
   */
  getDefaultImport() {
    return this.getNodeProperty("name");
  }

  /**
   * Gets the named bindings of the import clause or throws if it doesn't exist.
   */
  getNamedBindingsOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getNamedBindings(), message ?? "Expected to find an import declaration's named bindings.", this);
  }

  /**
   * Gets the named bindings of the import clause or returns undefined if it doesn't exist.
   */
  getNamedBindings() {
    return this.getNodeProperty("namedBindings");
  }

  /**
   * Gets the namespace import if it exists or throws.
   */
  getNamespaceImportOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getNamespaceImport(), message ?? "Expected to find a namespace import.", this);
  }

  /**
   * Gets the namespace import identifier, if it exists.
   */
  getNamespaceImport() {
    const namedBindings = this.getNamedBindings();
    if (namedBindings == null || !Node.isNamespaceImport(namedBindings))
      return undefined;
    return namedBindings.getNameNode();
  }

  /**
   * Gets the namespace import identifier, if it exists.
   */
  getNamedImports() {
    const namedBindings = this.getNamedBindings();
    if (namedBindings == null || !Node.isNamedImports(namedBindings))
      return [];
    return namedBindings.getElements();
  }
}
