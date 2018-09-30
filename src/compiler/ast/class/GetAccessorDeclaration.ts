import * as errors from "../../../errors";
import { removeClassMember } from "../../../manipulation";
import { GetAccessorDeclarationStructure, GetAccessorDeclarationSpecificStructure } from "../../../structures";
import { SyntaxKind, ts } from "../../../typescript";
import { BodyableNode, ChildOrderableNode, DecoratableNode, PropertyNamedNode, ScopedNode, StaticableNode, TextInsertableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { FunctionLikeDeclaration } from "../function";
import { AbstractableNode } from "./base";
import { SetAccessorDeclaration } from "./SetAccessorDeclaration";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const GetAccessorDeclarationBase = ChildOrderableNode(TextInsertableNode(DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(
    FunctionLikeDeclaration(BodyableNode(PropertyNamedNode(Node)))
))))));
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
        const parent = this.getParentIfKindOrThrow(SyntaxKind.ClassDeclaration);
        const thisName = this.getName();
        for (const prop of parent.getInstanceProperties()) {
            if (prop.getName() === thisName && prop.getKind() === SyntaxKind.SetAccessor)
                return prop as SetAccessorDeclaration;
        }

        return undefined;
    }

    /**
     * Gets the corresponding set accessor or throws if not exists.
     */
    getSetAccessorOrThrow(): SetAccessorDeclaration {
        return errors.throwIfNullOrUndefined(this.getSetAccessor(), () => `Expected to find a corresponding set accessor for ${this.getName()}.`);
    }

    /**
     * Removes the get accessor.
     */
    remove() {
        removeClassMember(this);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): GetAccessorDeclarationStructure {
        return callBaseGetStructure<GetAccessorDeclarationSpecificStructure>(GetAccessorDeclarationBase.prototype, this, {
        }) as any as GetAccessorDeclarationStructure;
    }
}
