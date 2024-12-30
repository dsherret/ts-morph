import { nameof, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren, removeCommaSeparatedChild } from "../../../manipulation";
import { ImportSpecifierSpecificStructure, ImportSpecifierStructure, StructureKind } from "../../../structures";
import { isValidVariableName } from "../../../utils";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { StringLiteral } from "../literal";

// todo: There's a lot of common code that could be shared with ExportSpecifier. It could be moved to a mixin.

export const ImportSpecifierBase = Node;
export class ImportSpecifier extends ImportSpecifierBase<ts.ImportSpecifier> {
  /**
   * Sets the identifier being imported.
   * @param name - Name being imported.
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
   * Gets the name of the import specifier.
   */
  getName() {
    const nameNode = this.getNameNode();
    if (nameNode.getKind() === ts.SyntaxKind.StringLiteral)
      return (nameNode as StringLiteral).getLiteralText();
    else
      return nameNode.getText();
  }

  /**
   * Gets the name node of what's being imported.
   */
  getNameNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.propertyName ?? this.compilerNode.name);
  }

  /**
   * Sets the alias for the name being imported and renames all the usages.
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
   * @remarks Use removeAliasWithRename() if you want it to rename any usages to the name of the import specifier.
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
   * Removes the alias and renames any usages to the name of the import specifier.
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
   * Gets the import declaration associated with this import specifier.
   */
  getImportDeclaration() {
    return this.getFirstAncestorByKindOrThrow(SyntaxKind.ImportDeclaration);
  }

  /**
   * Remove the import specifier.
   */
  remove() {
    const importDeclaration = this.getImportDeclaration();
    const namedImports = importDeclaration.getNamedImports();

    if (namedImports.length > 1 || importDeclaration.getNamespaceImport() == null && importDeclaration.getDefaultImport() == null)
      removeCommaSeparatedChild(this);
    else
      importDeclaration.removeNamedImports();
  }

  /**
   * Sets the node from a structure.
   * @param structure - Structure to set the node with.
   */
  set(structure: Partial<ImportSpecifierStructure>) {
    callBaseSet(ImportSpecifierBase.prototype, this, structure);

    if (structure.isTypeOnly != null)
      this.setIsTypeOnly(structure.isTypeOnly);

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
  getStructure() {
    const alias = this.getAliasNode();
    return callBaseGetStructure<ImportSpecifierSpecificStructure>(ImportSpecifierBase.prototype, this, {
      kind: StructureKind.ImportSpecifier,
      name: this.getName(),
      alias: alias ? alias.getText() : undefined,
      isTypeOnly: this.isTypeOnly(),
    }) as ImportSpecifierStructure;
  }
}
