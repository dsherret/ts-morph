import { removeInterfaceMember } from "../../../manipulation";
import { IndexSignatureDeclarationStructure, IndexSignatureDeclarationSpecificStructure } from "../../../structures";
import * as errors from "../../../errors";
import { ts } from "../../../typescript";
import { Type } from "../../types";
import { ChildOrderableNode, JSDocableNode, ModifierableNode, ReadonlyableNode, ReturnTypedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { TypeNode } from "../type";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const IndexSignatureDeclarationBase = ReturnTypedNode(ChildOrderableNode(JSDocableNode(ReadonlyableNode(ModifierableNode(TypeElement)))));
export class IndexSignatureDeclaration extends IndexSignatureDeclarationBase<ts.IndexSignatureDeclaration> {
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
        errors.throwIfWhitespaceOrNotString(name, nameof(name));
        if (this.getKeyName() === name)
            return;

        this.getKeyNameNode().replaceWithText(name, this.getWriterWithQueuedChildIndentation());
    }

    /**
     * Gets the key name node.
     */
    getKeyNameNode() {
        const param = this.compilerNode.parameters[0];
        return this.getNodeFromCompilerNode(param.name);
    }

    /**
     * Gets the key type.
     */
    getKeyType(): Type {
        return this.getKeyNameNode().getType();
    }

    /**
     * Sets the key type.
     * @param type - Type.
     */
    setKeyType(type: string) {
        errors.throwIfWhitespaceOrNotString(type, nameof(type));
        const keyTypeNode = this.getKeyTypeNode();
        if (keyTypeNode.getText() === type)
            return this;

        keyTypeNode.replaceWithText(type, this.getWriterWithQueuedChildIndentation());

        return this;
    }

    /**
     * Gets the key type node.
     */
    getKeyTypeNode(): TypeNode {
        // this node must exist for it to be an index signature (otherwise it's a property signature)
        const param = this.compilerNode.parameters[0];
        return this.getNodeFromCompilerNode(param.type!);
    }

    /**
     * Removes this index signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<IndexSignatureDeclarationStructure>) {
        callBaseSet(IndexSignatureDeclarationBase.prototype, this, structure);

        if (structure.keyName != null)
            this.setKeyName(structure.keyName);
        if (structure.keyType != null)
            this.setKeyType(structure.keyType);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): IndexSignatureDeclarationStructure {
        const keyTypeNode = this.getKeyTypeNode();

        return callBaseGetStructure<IndexSignatureDeclarationSpecificStructure>(IndexSignatureDeclarationBase.prototype, this, {
            keyName: this.getKeyName(),
            keyType: keyTypeNode.getText()
        });
    }
}
