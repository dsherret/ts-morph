import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class ConditionalTypeNode extends TypeNode<ts.ConditionalTypeNode> {
    /**
     * Gets the conditional type node's check type.
     *
     * Ex. In `CheckType extends ExtendsType ? TrueType : FalseType` returns `CheckType`.
     */
    getCheckType() {
        return this._getNodeFromCompilerNode(this.compilerNode.checkType);
    }

    /**
     * Gets the conditional type node's extends type.
     *
     * Ex. In `CheckType extends ExtendsType ? TrueType : FalseType` returns `ExtendsType`.
     */
    getExtendsType() {
        return this._getNodeFromCompilerNode(this.compilerNode.extendsType);
    }

    /**
     * Gets the conditional type node's true type.
     *
     * Ex. In `CheckType extends ExtendsType ? TrueType : FalseType` returns `TrueType`.
     */
    getTrueType() {
        return this._getNodeFromCompilerNode(this.compilerNode.trueType);
    }

    /**
     * Gets the conditional type node's false type.
     *
     * Ex. In `CheckType extends ExtendsType ? TrueType : FalseType` returns `FalseType`.
     */
    getFalseType() {
        return this._getNodeFromCompilerNode(this.compilerNode.falseType);
    }
}
