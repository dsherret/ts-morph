import { SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren, removeCommaSeparatedChild } from "../../../manipulation";
import { ParameterDeclarationSpecificStructure, ParameterDeclarationStructure, StructureKind } from "../../../structures";
import { WriterFunction } from "../../../types";
import { BindingNamedNode, DecoratableNode, DotDotDotTokenableNode, InitializerExpressionableNode, ModifierableNode, OverrideableNode, QuestionTokenableNode,
    ReadonlyableNode, ScopeableNode, TypedNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common/Node";

const createBase = <T extends typeof Node>(ctor: T) =>
    OverrideableNode(QuestionTokenableNode(DecoratableNode(ScopeableNode(ReadonlyableNode(ModifierableNode(
        DotDotDotTokenableNode(TypedNode(InitializerExpressionableNode(BindingNamedNode(ctor)))),
    ))))));
export const ParameterDeclarationBase = createBase(Node);
export class ParameterDeclaration extends ParameterDeclarationBase<ts.ParameterDeclaration> {
    /**
     * Gets if it's a rest parameter.
     */
    isRestParameter() {
        return this.compilerNode.dotDotDotToken != null;
    }

    /**
     * Gets if this is a property with a scope, readonly, or override keyword (found in class constructors).
     */
    isParameterProperty() {
        return this.getScope() != null || this.isReadonly() || this.hasOverrideKeyword();
    }

    /**
     * Sets if it's a rest parameter.
     * @param value - Sets if it's a rest parameter or not.
     */
    setIsRestParameter(value: boolean) {
        if (this.isRestParameter() === value)
            return this;

        if (value) {
            addParensIfNecessary(this);
            insertIntoParentTextRange({
                insertPos: this.getNameNode().getStart(),
                parent: this,
                newText: "...",
            });
        }
        else {
            removeChildren({ children: [this.getDotDotDotTokenOrThrow()] });
        }

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

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ParameterDeclarationStructure>) {
        callBaseSet(ParameterDeclarationBase.prototype, this, structure);

        if (structure.isRestParameter != null)
            this.setIsRestParameter(structure.isRestParameter);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ParameterDeclarationStructure {
        return callBaseGetStructure<ParameterDeclarationSpecificStructure>(ParameterDeclarationBase.prototype, this, {
            kind: StructureKind.Parameter,
            isRestParameter: this.isRestParameter(),
        }) as any as ParameterDeclarationStructure;
    }

    // ------ Methods to override to add parens ------

    /**
     * Sets if this node has a question token.
     * @param value - If it should have a question token or not.
     */
    setHasQuestionToken(value: boolean) {
        if (value)
            addParensIfNecessary(this);

        super.setHasQuestionToken(value);
        return this;
    }

    /**
     * Sets the initializer.
     * @param text - Text or writer function to set for the initializer.
     */
    setInitializer(textOrWriterFunction: string | WriterFunction) {
        addParensIfNecessary(this);
        super.setInitializer(textOrWriterFunction);
        return this;
    }

    /**
     * Sets the type.
     * @param textOrWriterFunction - Text or writer function to set the type with.
     */
    setType(textOrWriterFunction: string | WriterFunction) {
        addParensIfNecessary(this);
        super.setType.call(this, textOrWriterFunction);
        return this;
    }
}

function addParensIfNecessary(parameter: Node) {
    const parent = parameter.getParentOrThrow();

    if (isParameterWithoutParens())
        addParens();

    function isParameterWithoutParens() {
        return Node.isArrowFunction(parent)
            && parent.compilerNode.parameters.length === 1
            && parameter.getParentSyntaxListOrThrow().getPreviousSiblingIfKind(SyntaxKind.OpenParenToken) == null;
    }

    function addParens() {
        const paramText = parameter.getText();
        insertIntoParentTextRange({
            parent,
            insertPos: parameter.getStart(),
            newText: `(${paramText})`,
            replacing: {
                textLength: paramText.length,
            },
            customMappings: newParent => {
                return [{ currentNode: parameter, newNode: (newParent as ts.ArrowFunction).parameters[0] }];
            },
        });
    }
}
