import * as ts from "typescript";
import {Node} from "./../common";
import {insertIntoParent, removeChildren, removeCommaSeparatedChild} from "./../../manipulation";
import {ParameterDeclarationStructure} from "./../../structures";
import {DeclarationNamedNode, InitializerExpressionableNode, TypedNode, ModifierableNode, ScopeableNode, ReadonlyableNode, DecoratableNode, QuestionTokenableNode} from "./../base";
import {callBaseFill} from "./../callBaseFill";

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
        return this.compilerNode.dotDotDotToken == null ? undefined : this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.dotDotDotToken, this.sourceFile);
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
            const nameIdentifier = this.getNameIdentifierOrThrow();
            insertIntoParent({
                insertPos: nameIdentifier.getStart(),
                childIndex: nameIdentifier.getChildIndex(),
                insertItemsCount: 1,
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
}
