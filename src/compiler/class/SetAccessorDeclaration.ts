import * as errors from "../../errors";
import { removeClassMember } from "../../manipulation";
import { SetAccessorDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { BodiedNode, ChildOrderableNode, DecoratableNode, PropertyNamedNode, ScopedNode, StaticableNode, TextInsertableNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { FunctionLikeDeclaration } from "../function";
import { AbstractableNode } from "./base";
import { GetAccessorDeclaration } from "./GetAccessorDeclaration";

export const SetAccessorDeclarationBase = ChildOrderableNode(TextInsertableNode(DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(
    BodiedNode(FunctionLikeDeclaration(PropertyNamedNode(Node))
)))))));
export class SetAccessorDeclaration extends SetAccessorDeclarationBase<ts.SetAccessorDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<SetAccessorDeclarationStructure>) {
        callBaseFill(SetAccessorDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the corresponding get accessor if one exists.
     */
    getGetAccessor(): GetAccessorDeclaration | undefined {
        const parent = this.getParentIfKindOrThrow(SyntaxKind.ClassDeclaration);
        const thisName = this.getName();
        for (const prop of parent.getInstanceProperties()) {
            if (prop.getKind() === SyntaxKind.GetAccessor && prop.getName() === thisName)
                return prop as GetAccessorDeclaration;
        }

        return undefined;
    }

    /**
     * Gets the corresponding get accessor or throws if not exists.
     */
    getGetAccessorOrThrow(): GetAccessorDeclaration {
        return errors.throwIfNullOrUndefined(this.getGetAccessor(), () => `Expected to find a corresponding get accessor for ${this.getName()}.`);
    }

    /**
     * Removes the set accessor.
     */
    remove() {
        removeClassMember(this);
    }
}
