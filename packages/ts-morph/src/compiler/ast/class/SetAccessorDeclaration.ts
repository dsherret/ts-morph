import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { SetAccessorDeclarationStructure, SetAccessorDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { BodyableNode, ChildOrderableNode, DecoratableNode, PropertyNamedNode, ScopedNode, StaticableNode, TextInsertableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { FunctionLikeDeclaration } from "../function";
import { GetAccessorDeclaration } from "./GetAccessorDeclaration";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { AbstractableNode } from "./base";
import { ClassElement } from "./ClassElement";
import { Node } from "../common";

const createBase = <T extends typeof ClassElement>(ctor: T) => ChildOrderableNode(TextInsertableNode(
    DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(FunctionLikeDeclaration(BodyableNode(PropertyNamedNode(ctor)))))))
));
export const SetAccessorDeclarationBase = createBase(ClassElement);
export class SetAccessorDeclaration extends SetAccessorDeclarationBase<ts.SetAccessorDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<SetAccessorDeclarationStructure>) {
        callBaseSet(SetAccessorDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the corresponding get accessor if one exists.
     */
    getGetAccessor(): GetAccessorDeclaration | undefined {
        const thisName = this.getName();
        const isStatic = this.isStatic();

        return this.getParentOrThrow().forEachChild(sibling => {
            if (Node.isGetAccessorDeclaration(sibling) && sibling.getName() === thisName && sibling.isStatic() === isStatic)
                return sibling;
            return undefined;
        });
    }

    /**
     * Gets the corresponding get accessor or throws if not exists.
     */
    getGetAccessorOrThrow(): GetAccessorDeclaration {
        return errors.throwIfNullOrUndefined(this.getGetAccessor(), () => `Expected to find a corresponding get accessor for ${this.getName()}.`);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): SetAccessorDeclarationStructure {
        return callBaseGetStructure<SetAccessorDeclarationSpecificStructure>(SetAccessorDeclarationBase.prototype, this, {
            kind: StructureKind.SetAccessor
        }) as any as SetAccessorDeclarationStructure;
    }
}
