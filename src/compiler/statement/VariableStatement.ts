import * as ts from "typescript";
import {removeStatementedNodeChild, insertIntoParent} from "./../../manipulation";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {VariableStatementStructure} from "./../../structures";
import {ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {NamespaceChildableNode} from "./../namespace";
import {callBaseFill} from "./../callBaseFill";
import {VariableDeclaration} from "./VariableDeclaration";
import {VariableDeclarationType} from "./VariableDeclarationType";

export const VariableStatementBase = NamespaceChildableNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(Node)))));
export class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[] {
        return this.compilerNode.declarationList.declarations.map(d => this.global.compilerFactory.getNodeFromCompilerNode(d, this.sourceFile) as VariableDeclaration);
    }

    /**
     * Gets the variable declaration type.
     */
    getDeclarationType(): VariableDeclarationType {
        const nodeFlags = this.compilerNode.declarationList.flags;

        if (nodeFlags & ts.NodeFlags.Let)
            return VariableDeclarationType.Let;
        else if (nodeFlags & ts.NodeFlags.Const)
            return VariableDeclarationType.Const;
        else
            return VariableDeclarationType.Var;
    }

    /**
     * Gets the variable declaration type keyword.
     */
    getDeclarationTypeKeyword(): Node {
        const declarationType = this.getDeclarationType();
        const declarationList = this.getNodeProperty("declarationList");
        switch (declarationType) {
            case VariableDeclarationType.Const:
                return declarationList.getFirstChildByKindOrThrow(ts.SyntaxKind.ConstKeyword);
            case VariableDeclarationType.Let:
                return declarationList.getFirstChildByKindOrThrow(ts.SyntaxKind.LetKeyword);
            case VariableDeclarationType.Var:
                return declarationList.getFirstChildByKindOrThrow(ts.SyntaxKind.VarKeyword);
            default:
                throw errors.getNotImplementedForNeverValueError(declarationType);
        }
    }

    /**
     * Sets the variable declaration type.
     * @param type - Type to set.
     */
    setDeclarationType(type: VariableDeclarationType) {
        if (this.getDeclarationType() === type)
            return this;
        const keyword = this.getDeclarationTypeKeyword();

        insertIntoParent({
            childIndex: keyword.getChildIndex(),
            insertItemsCount: 1,
            insertPos: keyword.getStart(),
            newText: type,
            parent: this.getNodeProperty("declarationList"),
            replacing: {
                nodes: [keyword],
                textLength: keyword.getWidth()
            }
        });

        return this;
    }

    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableStatementStructure>) {
        callBaseFill(VariableStatementBase.prototype, this, structure);

        if (structure.declarationType != null)
            this.setDeclarationType(structure.declarationType);
        if (structure.declarations != null)
            throw new errors.NotImplementedError("Filling variable declarations not implemented. Please open an issue if you need this and I will increase the prioirty.");

        return this;
    }

    /**
     * Removes this variable statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
