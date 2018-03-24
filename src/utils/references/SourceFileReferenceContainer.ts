import {Node, StringLiteral, ImportDeclaration, ExportDeclaration, ImportEqualsDeclaration, SourceFile, StatementedNode, CallExpression} from "../../compiler";
import {SyntaxKind} from "../../typescript";
import {ArrayUtils} from "../ArrayUtils";
import {TypeGuards} from "../TypeGuards";
import {createHashSet, KeyValueCache} from "../collections";
import {ModuleUtils} from "../compiler";

export type SourceFileReferencingNodes = ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration | CallExpression;

export class SourceFileReferenceContainer {
    private readonly nodesInThis = new KeyValueCache<StringLiteral, SourceFile>();
    private readonly nodesInOther = new KeyValueCache<StringLiteral, SourceFile>();

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
        this.clear();
        this.populateReferences();
    }

    clear() {
        for (const [node, sourceFile] of this.nodesInThis.getEntries()) {
            this.nodesInThis.removeByKey(node);
            sourceFile._referenceContainer.nodesInOther.removeByKey(node);
        }
    }

    private populateReferences() {
        this.sourceFile.global.compilerFactory.forgetNodesCreatedInBlock(remember => {
            const addNode = (literal: StringLiteral, sourceFile: SourceFile | undefined) => {
                if (sourceFile == null)
                    return;
                this.addNodeInThis(literal, sourceFile);
                remember(literal);
            };

            for (const literal of this.sourceFile.getImportStringLiterals()) {
                const parent = literal.getParentOrThrow();
                const grandParent = parent.getParent();
                if (TypeGuards.isImportDeclaration(parent) || TypeGuards.isExportDeclaration(parent))
                    addNode(literal, parent.getModuleSpecifierSourceFile());
                else if (grandParent != null && TypeGuards.isImportEqualsDeclaration(grandParent))
                    addNode(literal, grandParent.getExternalModuleReferenceSourceFile());
                else if (TypeGuards.isCallExpression(parent)) {
                    const literalSymbol = literal.getSymbol();
                    if (literalSymbol != null)
                        addNode(literal, ModuleUtils.getReferencedSourceFileFromSymbol(literalSymbol));
                }
                else
                    this.sourceFile.global.logger.warn(`Unknown import string literal parent: ${parent.getKindName()}`);
            }
        });
    }

    private addNodeInThis(literal: StringLiteral, sourceFile: SourceFile) {
        this.nodesInThis.set(literal, sourceFile);
        sourceFile._referenceContainer.nodesInOther.set(literal, sourceFile);
    }
}
