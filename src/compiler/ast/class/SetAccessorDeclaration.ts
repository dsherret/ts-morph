import * as errors from "../../../errors";
import { SetAccessorDeclarationStructure, SetAccessorDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { SyntaxKind, ts } from "../../../typescript";
import { BodyableNode, ChildOrderableNode, DecoratableNode, PropertyNamedNode, ScopedNode, StaticableNode, TextInsertableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { FunctionLikeDeclaration } from "../function";
import { AbstractableNode } from "./base";
import { GetAccessorDeclaration } from "./GetAccessorDeclaration";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ClassElement } from "./ClassElement";

export const SetAccessorDeclarationBase = ChildOrderableNode(TextInsertableNode(DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(
    FunctionLikeDeclaration(BodyableNode(PropertyNamedNode(ClassElement))
)))))));
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
        const parent = this.getParentIfKindOrThrow(SyntaxKind.ClassDeclaration);
        const thisName = this.getName();

        return parent.getInstanceProperties().find(p => p.getKind() === SyntaxKind.GetAccessor && p.getName() === thisName) as GetAccessorDeclaration | undefined;
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
