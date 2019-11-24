import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { GetAccessorDeclarationStructure, GetAccessorDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { BodyableNode, ChildOrderableNode, DecoratableNode, PropertyNamedNode, ScopedNode, StaticableNode, TextInsertableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { FunctionLikeDeclaration } from "../function";
import { SetAccessorDeclaration } from "./SetAccessorDeclaration";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { AbstractableNode } from "./base";
import { ClassElement } from "./ClassElement";
import { Node } from "../common";

const createBase = <T extends typeof ClassElement>(ctor: T) => ChildOrderableNode(TextInsertableNode(DecoratableNode(
    AbstractableNode(ScopedNode(StaticableNode(FunctionLikeDeclaration(BodyableNode(PropertyNamedNode(ctor))))))
)));
export const GetAccessorDeclarationBase = createBase(ClassElement);
export class GetAccessorDeclaration extends GetAccessorDeclarationBase<ts.GetAccessorDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<GetAccessorDeclarationStructure>) {
        callBaseSet(GetAccessorDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the corresponding set accessor if one exists.
     */
    getSetAccessor(): SetAccessorDeclaration | undefined {
        const thisName = this.getName();
        const isStatic = this.isStatic();

        return this.getParentOrThrow().forEachChild(sibling => {
            if (Node.isSetAccessorDeclaration(sibling) && sibling.getName() === thisName && sibling.isStatic() === isStatic)
                return sibling;
            return undefined;
        });
    }

    /**
     * Gets the corresponding set accessor or throws if not exists.
     */
    getSetAccessorOrThrow(): SetAccessorDeclaration {
        return errors.throwIfNullOrUndefined(this.getSetAccessor(), () => `Expected to find a corresponding set accessor for ${this.getName()}.`);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): GetAccessorDeclarationStructure {
        return callBaseGetStructure<GetAccessorDeclarationSpecificStructure>(GetAccessorDeclarationBase.prototype, this, {
            kind: StructureKind.GetAccessor
        }) as any as GetAccessorDeclarationStructure;
    }
}
