import { KeyValueCache } from "@ts-morph/common";
import { CallExpression, ExportDeclaration, ImportDeclaration, ImportEqualsDeclaration, Node, SourceFile, StringLiteral } from "../../compiler";
import { ModuleUtils } from "../compiler";
export type SourceFileReferencingNodes = ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration | CallExpression;

export class SourceFileReferenceContainer {
  readonly #sourceFile: SourceFile;
  readonly #nodesInThis = new KeyValueCache<StringLiteral, SourceFile>();
  readonly #nodesInOther = new KeyValueCache<StringLiteral, SourceFile>();
  readonly #unresolvedLiterals: StringLiteral[] = [];

  constructor(sourceFile: SourceFile) {
    this.#sourceFile = sourceFile;
  }

  getDependentSourceFiles() {
    this.#sourceFile._context.lazyReferenceCoordinator.refreshDirtySourceFiles();
    const hashSet = new Set<SourceFile>();
    for (const nodeInOther of this.#nodesInOther.getKeys())
      hashSet.add(nodeInOther._sourceFile);
    return hashSet.values();
  }

  getLiteralsReferencingOtherSourceFilesEntries() {
    this.#sourceFile._context.lazyReferenceCoordinator.refreshSourceFileIfDirty(this.#sourceFile);
    return this.#nodesInThis.getEntries();
  }

  getReferencingLiteralsInOtherSourceFiles() {
    this.#sourceFile._context.lazyReferenceCoordinator.refreshDirtySourceFiles();
    return this.#nodesInOther.getKeys();
  }

  refresh() {
    if (this.#unresolvedLiterals.length > 0)
      this.#sourceFile._context.compilerFactory.onSourceFileAdded(this.#resolveUnresolved, false);

    this.clear();
    this.#populateReferences();

    if (this.#unresolvedLiterals.length > 0)
      this.#sourceFile._context.compilerFactory.onSourceFileAdded(this.#resolveUnresolved);
  }

  clear() {
    this.#unresolvedLiterals.length = 0;
    for (const [node, sourceFile] of this.#nodesInThis.getEntries()) {
      this.#nodesInThis.removeByKey(node);
      sourceFile._referenceContainer.#nodesInOther.removeByKey(node);
    }
  }

  #resolveUnresolved = () => {
    for (let i = this.#unresolvedLiterals.length - 1; i >= 0; i--) {
      const literal = this.#unresolvedLiterals[i];
      const sourceFile = this.#getSourceFileForLiteral(literal);
      if (sourceFile != null) {
        this.#unresolvedLiterals.splice(i, 1);
        this.#addNodeInThis(literal, sourceFile);
      }
    }

    if (this.#unresolvedLiterals.length === 0)
      this.#sourceFile._context.compilerFactory.onSourceFileAdded(this.#resolveUnresolved, false);
  };

  #populateReferences() {
    this.#sourceFile._context.compilerFactory.forgetNodesCreatedInBlock(remember => {
      for (const literal of this.#sourceFile.getImportStringLiterals()) {
        const sourceFile = this.#getSourceFileForLiteral(literal);
        remember(literal);

        if (sourceFile == null)
          this.#unresolvedLiterals.push(literal);
        else
          this.#addNodeInThis(literal, sourceFile);
      }
    });
  }

  #getSourceFileForLiteral(literal: StringLiteral) {
    const parent = literal.getParentOrThrow();
    const grandParent = parent.getParent();

    if (Node.isImportDeclaration(parent) || Node.isExportDeclaration(parent))
      return parent.getModuleSpecifierSourceFile();
    else if (grandParent != null && Node.isImportEqualsDeclaration(grandParent))
      return grandParent.getExternalModuleReferenceSourceFile();
    else if (grandParent != null && Node.isImportTypeNode(grandParent)) {
      const importTypeSymbol = grandParent.getSymbol();
      if (importTypeSymbol != null)
        return ModuleUtils.getReferencedSourceFileFromSymbol(importTypeSymbol);
    } else if (Node.isCallExpression(parent)) {
      const literalSymbol = literal.getSymbol();
      if (literalSymbol != null)
        return ModuleUtils.getReferencedSourceFileFromSymbol(literalSymbol);
    } else {
      this.#sourceFile._context.logger.warn(`Unknown import string literal parent: ${parent.getKindName()}`);
    }

    return undefined;
  }

  #addNodeInThis(literal: StringLiteral, sourceFile: SourceFile) {
    this.#nodesInThis.set(literal, sourceFile);
    sourceFile._referenceContainer.#nodesInOther.set(literal, sourceFile);
  }
}
