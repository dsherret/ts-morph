import { SyntaxKind, ts } from "@ts-morph/common";
import * as getStructureFuncs from "../../../manipulation/helpers/getStructureFunctions";
import { ConstructorDeclarationOverloadStructure, ConstructorDeclarationOverloadSpecificStructure, ConstructorDeclarationStructure,
    ConstructorDeclarationSpecificStructure, StructureKind, OptionalKind } from "../../../structures";
import { isNodeAmbientOrInAmbientContext } from "../../../utils";
import { BodyableNode, ChildOrderableNode, ScopedNode, TextInsertableNode, SignaturedDeclaration, ModifierableNode, JSDocableNode,
    TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { FunctionLikeDeclaration, insertOverloads, OverloadableNode } from "../function";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ClassElement } from "./ClassElement";

const createBase = <T extends typeof ClassElement>(ctor: T) => ChildOrderableNode(TextInsertableNode(OverloadableNode(
    ScopedNode(FunctionLikeDeclaration(BodyableNode(ctor)))
)));
export const ConstructorDeclarationBase = createBase(ClassElement);
const createOverloadBase = <T extends typeof ClassElement>(ctor: T) => TypeParameteredNode(JSDocableNode(
    ChildOrderableNode(TextInsertableNode(ScopedNode(ModifierableNode(SignaturedDeclaration(ctor)))))
));
export const ConstructorDeclarationOverloadBase = createOverloadBase(ClassElement);
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ConstructorDeclarationStructure>) {
        callBaseSet(ConstructorDeclarationBase.prototype, this, structure);

        if (structure.overloads != null) {
            this.getOverloads().forEach(o => o.remove());
            this.addOverloads(structure.overloads);
        }

        return this;
    }

    /**
     * Add a constructor overload.
     * @param structure - Structure to add.
     */
    addOverload(structure: OptionalKind<ConstructorDeclarationOverloadStructure>) {
        return this.addOverloads([structure])[0];
    }

    /**
     * Add constructor overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures: ReadonlyArray<OptionalKind<ConstructorDeclarationOverloadStructure>>) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }

    /**
     * Inserts a constructor overload.
     * @param index - Child index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index: number, structure: OptionalKind<ConstructorDeclarationOverloadStructure>) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts constructor overloads.
     * @param index - Child index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index: number, structures: ReadonlyArray<OptionalKind<ConstructorDeclarationOverloadStructure>>) {
        const printer = this._context.structurePrinterFactory.forConstructorDeclaration({
            isAmbient: isNodeAmbientOrInAmbientContext(this)
        });

        return insertOverloads<ConstructorDeclaration, OptionalKind<ConstructorDeclarationOverloadStructure>>({
            node: this,
            index,
            structures,
            printStructure: (writer, structure) => {
                printer.printOverload(writer, structure);
            },
            getThisStructure: getStructureFuncs.fromConstructorDeclarationOverload,
            expectedSyntaxKind: SyntaxKind.Constructor
        });
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ConstructorDeclarationStructure | ConstructorDeclarationOverloadStructure {
        const hasImplementation = this.getImplementation() != null;
        const isOverload = this.isOverload();
        const basePrototype = isOverload && hasImplementation ? ConstructorDeclarationOverloadBase.prototype : ConstructorDeclarationBase.prototype;

        return callBaseGetStructure<any>(basePrototype, this, getStructure(this)) as ConstructorDeclarationStructure | ConstructorDeclarationOverloadStructure;

        function getStructure(thisNode: ConstructorDeclaration) {
            // this is not the best typing... unit tests will catch issues though
            if (hasImplementation && isOverload)
                return getSpecificOverloadStructure();
            return getSpecificStructure();

            function getSpecificOverloadStructure(): ConstructorDeclarationOverloadSpecificStructure {
                return { kind: StructureKind.ConstructorOverload };
            }

            function getSpecificStructure(): ConstructorDeclarationSpecificStructure {
                if (!hasImplementation)
                    return { kind: StructureKind.Constructor };
                else {
                    return {
                        kind: StructureKind.Constructor,
                        overloads: thisNode.getOverloads().map(o => o.getStructure() as ConstructorDeclarationOverloadStructure)
                    };
                }
            }
        }
    }
}
