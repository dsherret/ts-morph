import { removeOverloadableClassMember } from "../../../manipulation";
import * as getStructureFuncs from "../../../manipulation/helpers/getStructureFunctions";
import { MethodDeclarationOverloadStructure, MethodDeclarationStructure, MethodDeclarationSpecificStructure } from "../../../structures";
import { SyntaxKind, ts } from "../../../typescript";
import { Signature } from "../../symbols";
import { AsyncableNode, BodyableNode, ChildOrderableNode, DecoratableNode, GeneratorableNode, PropertyNamedNode, ScopedNode, StaticableNode,
    TextInsertableNode, SignaturedDeclaration, ModifierableNode, JSDocableNode, TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { FunctionLikeDeclaration, insertOverloads, OverloadableNode } from "../function";
import { AbstractableNode } from "./base";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const MethodDeclarationBase = ChildOrderableNode(TextInsertableNode(OverloadableNode(BodyableNode(DecoratableNode(AbstractableNode(ScopedNode(
    StaticableNode(AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(PropertyNamedNode(Node)))))
)))))));
export const MethodDeclarationOverloadBase = JSDocableNode(ChildOrderableNode(TextInsertableNode(ScopedNode(TypeParameteredNode(AbstractableNode(
    StaticableNode(AsyncableNode(ModifierableNode(GeneratorableNode(SignaturedDeclaration(Node)
))))))))));

export class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<MethodDeclarationStructure>) {
        callBaseSet(MethodDeclarationBase.prototype, this, structure);

        if (structure.overloads != null) {
            this.getOverloads().forEach(o => o.remove());
            this.addOverloads(structure.overloads);
        }

        return this;
    }

    /**
     * Add a method overload.
     * @param structure - Structure to add.
     */
    addOverload(structure: MethodDeclarationOverloadStructure) {
        return this.addOverloads([structure])[0];
    }

    /**
     * Add method overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures: ReadonlyArray<MethodDeclarationOverloadStructure>) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }

    /**
     * Inserts a method overload.
     * @param index - Child index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index: number, structure: MethodDeclarationOverloadStructure) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts method overloads.
     * @param index - Child index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index: number, structures: ReadonlyArray<MethodDeclarationOverloadStructure>) {
        const thisName = this.getName();
        const childCodes = structures.map(structure => `${thisName}();`);

        return insertOverloads<MethodDeclaration, MethodDeclarationOverloadStructure>({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromMethodDeclarationOverload,
            setNodeFromStructure: (node, structure) => node.set(structure),
            expectedSyntaxKind: SyntaxKind.MethodDeclaration
        });
    }

    /**
     * Removes the method.
     */
    remove() {
        removeOverloadableClassMember(this);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): MethodDeclarationStructure | MethodDeclarationOverloadStructure {
        const hasImplementation = this.getImplementation() != null;
        const isOverload = this.isOverload();
        const basePrototype = isOverload && hasImplementation ? MethodDeclarationOverloadBase.prototype : MethodDeclarationBase.prototype;
        const structure = !hasImplementation || isOverload ? {} : { overloads: this.getOverloads().map(o => o.getStructure()) };

        return callBaseGetStructure<any>(basePrototype, this,
            structure) as any as MethodDeclarationStructure | MethodDeclarationOverloadStructure;
    }
}
