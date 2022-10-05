import { errors, nameof, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren, removeCommaSeparatedChild } from "../../../manipulation";
import { ExportSpecifierSpecificStructure, ExportSpecifierStructure, StructureKind } from "../../../structures";
import { Symbol } from "../../symbols";
import { LocalTargetDeclarations } from "../aliases";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";

// todo: There's a lot of common code that could be shared with ImportSpecifier. It could be moved to a mixin.

export const ExportSpecifierBase = Node;
export class ExportSpecifier extends ExportSpecifierBase<ts.ExportSpecifier> {
  /**
   * Sets the name of what's being exported.
   */
  setName(name: string) {
    const nameNode = this.getNameNode();
    if (nameNode.getText() === name)
      return this;

    nameNode.replaceWithText(name);

    return this;
  }

  /**
   * Gets the name of the export specifier.
   */
  getName() {
    return this.getNameNode().getText();
  }

  /**
   * Gets the name node of what's being exported.
   */
  getNameNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.propertyName || this.compilerNode.name);
  }

  /**
   * Sets the alias for the name being exported and renames all the usages.
   * @param alias - Alias to set.
   */
  renameAlias(alias: string) {
    if (StringUtils.isNullOrWhitespace(alias)) {
      this.removeAliasWithRename();
      return this;
    }

    let aliasIdentifier = this.getAliasNode();
    if (aliasIdentifier == null) {
      // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
      this.setAlias(this.getName());
      aliasIdentifier = this.getAliasNode()!;
    }
    aliasIdentifier.rename(alias);
    return this;
  }

  /**
   * Sets the alias without renaming all the usages.
   * @param alias - Alias to set.
   */
  setAlias(alias: string) {
    if (StringUtils.isNullOrWhitespace(alias)) {
      this.removeAlias();
      return this;
    }

    const aliasIdentifier = this.getAliasNode();
    if (aliasIdentifier == null) {
      insertIntoParentTextRange({
        insertPos: this.getNameNode().getEnd(),
        parent: this,
        newText: ` as ${alias}`,
      });
    } else {
      aliasIdentifier.replaceWithText(alias);
    }

    return this;
  }

  /**
   * Removes the alias without renaming.
   * @remarks Use removeAliasWithRename() if you want it to rename any usages to the name of the export specifier.
   */
  removeAlias() {
    const aliasIdentifier = this.getAliasNode();
    if (aliasIdentifier == null)
      return this;

    removeChildren({
      children: [this.getFirstChildByKindOrThrow(SyntaxKind.AsKeyword), aliasIdentifier],
      removePrecedingSpaces: true,
      removePrecedingNewLines: true,
    });

    return this;
  }

  /**
   * Removes the alias and renames any usages to the name of the export specifier.
   */
  removeAliasWithRename() {
    const aliasIdentifier = this.getAliasNode();
    if (aliasIdentifier == null)
      return this;

    aliasIdentifier.rename(this.getName());
    this.removeAlias();

    return this;
  }

  /**
   * Gets the alias identifier, if it exists.
   */
  getAliasNode() {
    if (this.compilerNode.propertyName == null)
      return undefined;
    return this._getNodeFromCompilerNode(this.compilerNode.name);
  }

  /** Gets if this is a type only import specifier. */
  isTypeOnly() {
    return this.compilerNode.isTypeOnly;
  }

  /** Sets if this is a type only import specifier. */
  setIsTypeOnly(value: boolean) {
    if (this.isTypeOnly() === value)
      return this;
    if (value) {
      insertIntoParentTextRange({
        insertPos: this.getStart(),
        parent: this,
        newText: `type `,
      });
    } else {
      removeChildren({
        children: [this.getFirstChildByKindOrThrow(ts.SyntaxKind.TypeKeyword)],
        removeFollowingSpaces: true,
      });
    }
    return this;
  }

  /**
   * Gets the export declaration associated with this export specifier.
   */
  getExportDeclaration() {
    return this.getFirstAncestorByKindOrThrow(SyntaxKind.ExportDeclaration);
  }

  /**
   * Gets the local target symbol of the export specifier or throws if it doesn't exist.
   */
  getLocalTargetSymbolOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getLocalTargetSymbol(), message || `The export specifier's local target symbol was expected.`, this);
  }

  /**
   * Gets the local target symbol of the export specifier or undefined if it doesn't exist.
   */
  getLocalTargetSymbol(): Symbol | undefined {
    return this._context.typeChecker.getExportSpecifierLocalTargetSymbol(this);
  }

  /**
   * Gets all the declarations referenced by the export specifier.
   */
  getLocalTargetDeclarations(): LocalTargetDeclarations[] {
    return this.getLocalTargetSymbol()?.getDeclarations() as LocalTargetDeclarations[] ?? [];
  }

  /**
   * Removes the export specifier.
   */
  remove() {
    const exportDeclaration = this.getExportDeclaration();
    const exports = exportDeclaration.getNamedExports();

    if (exports.length > 1)
      removeCommaSeparatedChild(this);
    else if (exportDeclaration.hasModuleSpecifier())
      exportDeclaration.toNamespaceExport();
    else
      exportDeclaration.remove();
  }

  /**
   * Sets the node from a structure.
   * @param structure - Structure to set the node with.
   */
  set(structure: Partial<ExportSpecifierStructure>) {
    callBaseSet(ExportSpecifierBase.prototype, this, structure);

    if (structure.name != null)
      this.setName(structure.name);

    if (structure.alias != null)
      this.setAlias(structure.alias);
    else if (structure.hasOwnProperty(nameof(structure, "alias")))
      this.removeAlias();

    return this;
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): ExportSpecifierStructure {
    const alias = this.getAliasNode();
    return callBaseGetStructure<ExportSpecifierSpecificStructure>(Node.prototype, this, {
      kind: StructureKind.ExportSpecifier,
      alias: alias ? alias.getText() : undefined,
      name: this.getNameNode().getText(),
    });
  }
}
