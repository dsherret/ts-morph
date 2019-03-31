import * as getStructureFuncs from "../../../manipulation/helpers/getStructureFunctions";
import { MethodDeclarationOverloadStructure, MethodDeclarationStructure, MethodDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { SyntaxKind, ts } from "../../../typescript";
import { AsyncableNode, BodyableNode, ChildOrderableNode, DecoratableNode, GeneratorableNode, PropertyNamedNode, ScopedNode, StaticableNode,
    TextInsertableNode, SignaturedDeclaration, ModifierableNode, JSDocableNode, TypeParameteredNode, QuestionTokenableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { FunctionLikeDeclaration, insertOverloads, OverloadableNode } from "../function";
import { AbstractableNode } from "./base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ClassElement } from "./ClassElement";

export const MethodDeclarationBase = ChildOrderableNode(TextInsertableNode(OverloadableNode(BodyableNode(DecoratableNode(AbstractableNode(ScopedNode(
    QuestionTokenableNode(StaticableNode(AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(PropertyNamedNode(ClassElement))))))
)))))));
export const MethodDeclarationOverloadBase = JSDocableNode(ChildOrderableNode(TextInsertableNode(ScopedNode(TypeParameteredNode(AbstractableNode(
    QuestionTokenableNode(StaticableNode(AsyncableNode(ModifierableNode(GeneratorableNode(SignaturedDeclaration(ClassElement))
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
        const childCodes = structures.map(_ => `${thisName}();`);

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
     * Gets the structure equivalent to this node.
     */
    getStructure(): MethodDeclarationStructure | MethodDeclarationOverloadStructure {
        const hasImplementation = this.getImplementation() != null;
        const isOverload = this.isOverload();
        const basePrototype = isOverload && hasImplementation ? MethodDeclarationOverloadBase.prototype : MethodDeclarationBase.prototype;

        return callBaseGetStructure<any>(basePrototype, this,
            getStructure(this)) as any as MethodDeclarationStructure | MethodDeclarationOverloadStructure;

        function getStructure(thisNode: MethodDeclaration) {
            // this is not the best typing... unit tests will catch issues though
            if (hasImplementation && isOverload)
                return {};
            return getSpecificStructure();

            function getSpecificStructure(): MethodDeclarationSpecificStructure {
                if (!hasImplementation)
                    return { kind: StructureKind.Method };
                else
                    return {
                        kind: StructureKind.Method,
                        overloads: thisNode.getOverloads().map(o => o.getStructure())
                    };
            }
        }
    }
}
