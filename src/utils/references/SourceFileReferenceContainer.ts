import { Node, StringLiteral, ImportDeclaration, ExportDeclaration, ImportEqualsDeclaration, SourceFile, StatementedNode, CallExpression } from "../../compiler";
import { SyntaxKind } from "../../typescript";
import { ArrayUtils } from "../ArrayUtils";
import { TypeGuards } from "../TypeGuards";
import { createHashSet, KeyValueCache } from "../collections";
import { ModuleUtils } from "../compiler";

export type SourceFileReferencingNodes = ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration | CallExpression;

export class SourceFileReferenceContainer {
    private readonly nodesInThis = new KeyValueCache<StringLiteral, SourceFile>();
    private readonly nodesInOther = new KeyValueCache<StringLiteral, SourceFile>();
    private readonly unresolvedLiterals: StringLiteral[] = [];

    constructor(private readonly sourceFile: SourceFile) {
    }

    getDependentSourceFiles() {
        this.sourceFile.global.lazyReferenceCoordinator.refreshDirtySourceFiles();
        const hashSet = createHashSet<SourceFile>();
        for (const nodeInOther of this.nodesInOther.getKeys())
            hashSet.add(nodeInOther.sourceFile);
        return hashSet.values();
    }

    getLiteralsReferencingOtherSourceFilesEntries() {
        this.sourceFile.global.lazyReferenceCoordinator.refreshSourceFileIfDirty(this.sourceFile);
        return this.nodesInThis.getEntries();
    }

    getReferencingLiteralsInOtherSourceFiles() {
        this.sourceFile.global.lazyReferenceCoordinator.refreshDirtySourceFiles();
        return this.nodesInOther.getKeys();
    }

    *getReferencingNodesInOtherSourceFiles() {
        for (const literal of this.getReferencingLiteralsInOtherSourceFiles()) {
            const parent = literal.getParentOrThrow();
            const grandParent = parent.getParent();
            if (grandParent != null && TypeGuards.isImportEqualsDeclaration(grandParent))
                yield grandParent;
            else
                yield literal.getParentOrThrow() as SourceFileReferencingNodes;
        }
    }

    refresh() {
        if (this.unresolvedLiterals.length > 0)
            this.sourceFile.global.compilerFactory.onSourceFileAdded(this.resolveUnresolved, false);

        this.clear();
        this.populateReferences();

        if (this.unresolvedLiterals.length > 0)
            this.sourceFile.global.compilerFactory.onSourceFileAdded(this.resolveUnresolved);
    }

    clear() {
        this.unresolvedLiterals.length = 0;
        for (const [node, sourceFile] of this.nodesInThis.getEntries()) {
            this.nodesInThis.removeByKey(node);
            sourceFile._referenceContainer.nodesInOther.removeByKey(node);
        }
    }

    private resolveUnresolved = () => {
        for (let i = this.unresolvedLiterals.length - 1; i >= 0; i--) {
            const literal = this.unresolvedLiterals[i];
            const sourceFile = this.getSourceFileForLiteral(literal);
            if (sourceFile != null) {
                this.unresolvedLiterals.splice(i, 1);
                this.addNodeInThis(literal, sourceFile);
            }
        }

        if (this.unresolvedLiterals.length === 0)
            this.sourceFile.global.compilerFactory.onSourceFileAdded(this.resolveUnresolved, false);
    }

    private populateReferences() {
        this.sourceFile.global.compilerFactory.forgetNodesCreatedInBlock(remember => {
            for (const literal of this.sourceFile.getImportStringLiterals()) {
                const sourceFile = this.getSourceFileForLiteral(literal);
                remember(literal);

                if (sourceFile == null)
                    this.unresolvedLiterals.push(literal);
                else
                    this.addNodeInThis(literal, sourceFile);
            }
        });
    }

    private getSourceFileForLiteral(literal: StringLiteral) {
        const parent = literal.getParentOrThrow();
        const grandParent = parent.getParent();

        if (TypeGuards.isImportDeclaration(parent) || TypeGuards.isExportDeclaration(parent))
            return parent.getModuleSpecifierSourceFile();
        else if (grandParent != null && TypeGuards.isImportEqualsDeclaration(grandParent))
            return grandParent.getExternalModuleReferenceSourceFile();
        else if (TypeGuards.isCallExpression(parent)) {
            const literalSymbol = literal.getSymbol();
            if (literalSymbol != null)
                return ModuleUtils.getReferencedSourceFileFromSymbol(literalSymbol);
        }
        else
            this.sourceFile.global.logger.warn(`Unknown import string literal parent: ${parent.getKindName()}`);

        return undefined;
    }

    private addNodeInThis(literal: StringLiteral, sourceFile: SourceFile) {
        this.nodesInThis.set(literal, sourceFile);
        sourceFile._referenceContainer.nodesInOther.set(literal, sourceFile);
    }
}
