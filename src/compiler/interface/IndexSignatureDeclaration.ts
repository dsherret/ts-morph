import {ts} from "./../../typescript";
import {IndexSignatureDeclarationStructure} from "./../../structures";
import {removeInterfaceMember} from "./../../manipulation";
import {callBaseFill} from "./../callBaseFill";
import {Node, Identifier} from "./../common";
import {TypeNode, Type} from "./../type";
import {JSDocableNode, ChildOrderableNode, ModifierableNode, ReadonlyableNode} from "./../base";

export const IndexSignatureDeclarationBase = ChildOrderableNode(JSDocableNode(ReadonlyableNode(ModifierableNode(Node))));
export class IndexSignatureDeclaration extends IndexSignatureDeclarationBase<ts.IndexSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<IndexSignatureDeclarationStructure>) {
        callBaseFill(IndexSignatureDeclarationBase.prototype, this, structure);

        if (structure.keyName != null)
            this.setKeyName(structure.keyName);
        if (structure.keyType != null)
            this.setKeyType(structure.keyType);
        if (structure.returnType != null)
            this.setReturnType(structure.returnType);

        return this;
    }

    /**
     * Gets the key name.
     */
    getKeyName() {
        return this.getKeyNameNode().getText();
    }

    /**
     * Sets the key name.
     * @param name - New name.
     */
    setKeyName(name: string) {
        if (this.getKeyName() === name)
            return;

        this.getKeyNameNode().replaceWithText(name);
    }

    /**
     * Gets the key name node.
     */
    getKeyNameNode() {
        const param = this.compilerNode.parameters[0];
        return this.getNodeFromCompilerNode<Identifier>(param.name);
    }

    /**
     * Gets the key type.
     */
    getKeyType(): Type {
        return this.getKeyTypeNode().getType();
    }

    /**
     * Sets the key type.
     * @param type - Type.
     */
    setKeyType(type: string) {
        if (this.getKeyTypeNode().getText() === type)
            return;
        this.getKeyTypeNode().replaceWithText(type);
    }

    /**
     * Gets the key type node.
     */
    getKeyTypeNode() {
        const param = this.compilerNode.parameters[0];
        return this.getNodeFromCompilerNode<TypeNode>(param.type!);
    }

    /**
     * Gets the return type.
     */
    getReturnType() {
        return this.getReturnTypeNode().getType();
    }

    /**
     * Gets the return type node.
     */
    getReturnTypeNode() {
        return this.getNodeFromCompilerNode<TypeNode>(this.compilerNode.type!);
    }

    /**
     * Sets the return type.
     * @param text
     */
    setReturnType(text: string) {
        const returnTypeNode = this.getReturnTypeNode();
        if (returnTypeNode.getText() === text)
            return this;

        returnTypeNode.replaceWithText(text);
        return this;
    }

    /**
     * Removes this index signature.
     */
    remove() {
        removeInterfaceMember(this);
    }
}
