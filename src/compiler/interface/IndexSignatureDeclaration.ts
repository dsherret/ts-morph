import { ts } from "../../typescript";
import { IndexSignatureDeclarationStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { getTextFromStringOrWriter } from "../../utils";
import { removeInterfaceMember } from "../../manipulation";
import { callBaseFill } from "../callBaseFill";
import { Node, Identifier } from "../common";
import { TypeNode, Type } from "../type";
import { JSDocableNode, ChildOrderableNode, ModifierableNode, ReadonlyableNode } from "../base";
import { TypeElement } from "./TypeElement";

export const IndexSignatureDeclarationBase = ChildOrderableNode(JSDocableNode(ReadonlyableNode(ModifierableNode(TypeElement))));
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
     * @param text - Text of the return type.
     */
    setReturnType(text: string): this;
    /**
     * Sets the return type.
     * @param writerFunction - Writer function to write the return type with.
     */
    setReturnType(writerFunction: WriterFunction): this;
    /** @internal */
    setReturnType(textOrWriterFunction: string | WriterFunction): this;
    setReturnType(textOrWriterFunction: string | WriterFunction) {
        const returnTypeNode = this.getReturnTypeNode();
        const text = getTextFromStringOrWriter(this.getWriterWithQueuedChildIndentation(), textOrWriterFunction);
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
