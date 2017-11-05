import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertIntoParent} from "./../../manipulation";
import {Node} from "./../common";
import {VariableDeclaration} from "./VariableDeclaration";
import {VariableDeclarationType} from "./VariableDeclarationType";

export class VariableDeclarationList extends Node<ts.VariableDeclarationList> {
    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[] {
        return this.compilerNode.declarations.map(d => this.global.compilerFactory.getNodeFromCompilerNode(d, this.sourceFile) as VariableDeclaration);
    }

    /**
     * Gets the variable declaration type.
     */
    getDeclarationType(): VariableDeclarationType {
        const nodeFlags = this.compilerNode.flags;

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
        switch (declarationType) {
            case VariableDeclarationType.Const:
                return this.getFirstChildByKindOrThrow(ts.SyntaxKind.ConstKeyword);
            case VariableDeclarationType.Let:
                return this.getFirstChildByKindOrThrow(ts.SyntaxKind.LetKeyword);
            case VariableDeclarationType.Var:
                return this.getFirstChildByKindOrThrow(ts.SyntaxKind.VarKeyword);
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
            parent: this,
            replacing: {
                nodes: [keyword],
                textLength: keyword.getWidth()
            }
        });

        return this;
    }
}
