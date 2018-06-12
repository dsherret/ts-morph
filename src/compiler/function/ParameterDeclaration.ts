import { insertIntoParentTextRange, removeChildren, removeCommaSeparatedChild } from "../../manipulation";
import { ParameterDeclarationStructure, AbstractableNodeStructure, ParameterDeclarationSpecificStructure } from "../../structures";
import { ts, SyntaxKind } from "../../typescript";
import { DeclarationNamedNode, DecoratableNode, InitializerExpressionableNode, ModifierableNode, QuestionTokenableNode, ReadonlyableNode, ScopeableNode, TypedNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common/Node";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const ParameterDeclarationBase = QuestionTokenableNode(DecoratableNode(ScopeableNode(ReadonlyableNode(ModifierableNode(
    TypedNode(InitializerExpressionableNode(DeclarationNamedNode(Node)))
)))));
export class ParameterDeclaration extends ParameterDeclarationBase<ts.ParameterDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ParameterDeclarationStructure>) {
        callBaseFill(ParameterDeclarationBase.prototype, this, structure);

        if (structure.isRestParameter != null)
            this.setIsRestParameter(structure.isRestParameter);

        return this;
    }

    /**
     * Gets the dot dot dot token (...) for a rest parameter.
     */
    getDotDotDotToken() {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.dotDotDotToken);
    }

    /**
     * Gets if it's a rest parameter.
     */
    isRestParameter() {
        return this.compilerNode.dotDotDotToken != null;
    }

    /**
     * Gets if this is a parameter property.
     */
    isParameterProperty() {
        return this.getScope() != null || this.isReadonly();
    }

    /**
     * Sets if it's a rest parameter.
     * @param value - Sets if it's a rest parameter or not.
     */
    setIsRestParameter(value: boolean) {
        if (this.isRestParameter() === value)
            return this;

        if (value) {
            insertIntoParentTextRange({
                insertPos: this.getNameNodeOrThrow().getStart(),
                parent: this,
                newText: "..."
            });
        }
        else
            removeChildren({ children: [this.getDotDotDotToken()!] });

        return this;
    }

    /**
     * Gets if it's optional.
     */
    isOptional() {
        return this.compilerNode.questionToken != null || this.isRestParameter() || this.hasInitializer();
    }

    /**
     * Remove this parameter.
     */
    remove() {
        removeCommaSeparatedChild(this);
    }

    getStructure(): ParameterDeclarationStructure {
        return callBaseGetStructure<ParameterDeclarationSpecificStructure>(ParameterDeclarationBase.prototype, this, {
            isRestParameter: this.isRestParameter()
        }) as any as ParameterDeclarationStructure; // TODO: might need to add this assertion... I'll make it better later
    }
}
