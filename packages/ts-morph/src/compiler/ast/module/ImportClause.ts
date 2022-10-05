import { errors, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { Node } from "../common";

export const ImportClauseBase = Node;
export class ImportClause extends ImportClauseBase<ts.ImportClause> {
  /** Gets if this import clause is type only. */
  isTypeOnly() {
    return this.compilerNode.isTypeOnly;
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

  /**
   * Gets the default import or throws if it doesn't exit.
   */
  getDefaultImportOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getDefaultImport(), message || "Expected to find a default import.", this);
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
    return errors.throwIfNullOrUndefined(this.getNamedBindings(), message || "Expected to find an import declaration's named bindings.", this);
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
    return errors.throwIfNullOrUndefined(this.getNamespaceImport(), message || "Expected to find a namespace import.", this);
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
