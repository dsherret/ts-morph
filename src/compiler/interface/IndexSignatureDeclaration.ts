import { removeInterfaceMember } from "../../manipulation";
import { IndexSignatureDeclarationStructure, IndexSignatureDeclarationSpecificStructure } from "../../structures";
import * as errors from "../../errors";
import { WriterFunction } from "../../types";
import { ts } from "../../typescript";
import { getTextFromStringOrWriter } from "../../utils";
import { ChildOrderableNode, JSDocableNode, ModifierableNode, ReadonlyableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Type, TypeNode } from "../type";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const IndexSignatureDeclarationBase = ChildOrderableNode(JSDocableNode(ReadonlyableNode(ModifierableNode(TypeElement))));
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
        return this.getKeyTypeNode().getType();
    }

    /**
     * Sets the key type.
     * @param type - Type.
     */
    setKeyType(type: string) {
        errors.throwIfWhitespaceOrNotString(type, nameof(type));
        if (this.getKeyTypeNode().getText() === type)
            return;
        this.getKeyTypeNode().replaceWithText(type, this.getWriterWithQueuedChildIndentation());
    }

    /**
     * Gets the key type node.
     */
    getKeyTypeNode(): TypeNode {
        const param = this.compilerNode.parameters[0];
        return this.getNodeFromCompilerNode(param.type!);
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
    getReturnTypeNode(): TypeNode {
        return this.getNodeFromCompilerNode(this.compilerNode.type!);
    }

    /**
     * Sets the return type.
     * @param textOrWriterFunction - Text to set as the return type.
     */
    setReturnType(textOrWriterFunction: string | WriterFunction) {
        const returnTypeNode = this.getReturnTypeNode();
        const text = getTextFromStringOrWriter(this.getWriterWithQueuedChildIndentation(), textOrWriterFunction);

        errors.throwIfWhitespaceOrNotString(text, nameof(textOrWriterFunction));

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
        if (structure.returnType != null)
            this.setReturnType(structure.returnType);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): IndexSignatureDeclarationStructure {
        return callBaseGetStructure<IndexSignatureDeclarationSpecificStructure>(IndexSignatureDeclarationBase.prototype, this, {
            keyName: this.getKeyName(),
            keyType: this.getKeyType().getText(),
            returnType: this.getReturnType().getText()
        });
    }
}
