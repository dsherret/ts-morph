import {Node, ImportDeclaration, ExportDeclaration, ImportEqualsDeclaration, SourceFile, StatementedNode, CallExpression} from "../../compiler";
import {SyntaxKind} from "../../typescript";
import {ArrayUtils} from "../ArrayUtils";
import {TypeGuards} from "../TypeGuards";
import {createHashSet} from "../HashSet";
import {KeyValueCache} from "../KeyValueCache";
import {ModuleUtils} from "../ModuleUtils";

export type SourceFileReferencingNodes = ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration | CallExpression;

export class SourceFileReferenceContainer {
    private readonly nodesInThis = new KeyValueCache<SourceFileReferencingNodes, SourceFile>();
    private readonly nodesInOther = new KeyValueCache<SourceFileReferencingNodes, SourceFile>();

    constructor(private readonly sourceFile: SourceFile) {
    }

    getDependentSourceFiles() {
        this.sourceFile.global.lazyReferenceCoordinator.refreshDirtySourceFiles();
        const hashSet = createHashSet<SourceFile>();
        for (const nodeInOther of this.nodesInOther.getKeys())
            hashSet.add(nodeInOther.sourceFile);
        return hashSet.values();
    }

    getNodesReferencingOtherSourceFiles() {
        this.sourceFile.global.lazyReferenceCoordinator.refreshSourceFileIfDirty(this.sourceFile);
        return this.nodesInThis.getKeys();
    }

    getNodesReferencingOtherSourceFilesEntries() {
        this.sourceFile.global.lazyReferenceCoordinator.refreshSourceFileIfDirty(this.sourceFile);
        return this.nodesInThis.getEntries();
    }

    getReferencingNodesInOtherSourceFiles() {
        this.sourceFile.global.lazyReferenceCoordinator.refreshDirtySourceFiles();
        return this.nodesInOther.getKeys();
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
            const addNode = (node: SourceFileReferencingNodes, sourceFile: SourceFile | undefined) => {
                if (sourceFile == null)
                    return;
                this.addNodeInThis(node, sourceFile);
                remember(node);
            };

            for (const node of this.sourceFile.getStatements()) {
                if (TypeGuards.isImportDeclaration(node) || TypeGuards.isExportDeclaration(node))
                    addNode(node, node.getModuleSpecifierSourceFile());
                else if (TypeGuards.isImportEqualsDeclaration(node))
                    addNode(node, node.getExternalModuleReferenceSourceFile());
                else
                    visitNode(node);
            }

            function visitNode(node: Node) {
                node.getChildren().forEach(n => visitNode(n));

                checkForImportCallExpression();

                function checkForImportCallExpression() {
                    if (node.getKind() !== SyntaxKind.ImportKeyword)
                        return;
                    const parent = node.getParentOrThrow();
                    if (!TypeGuards.isCallExpression(parent))
                        return;
                    const arg = parent.getArguments()[0];
                    if (arg == null || !TypeGuards.isStringLiteral(arg))
                        return;
                    const argSymbol = arg.getSymbol();
                    if (argSymbol == null)
                        return;
                    addNode(parent, ModuleUtils.getReferencedSourceFileFromSymbol(argSymbol));
                }
            }
        });
    }

    private addNodeInThis(node: SourceFileReferencingNodes, sourceFile: SourceFile) {
        this.nodesInThis.set(node, sourceFile);
        sourceFile._referenceContainer.nodesInOther.set(node, sourceFile);
    }
}
