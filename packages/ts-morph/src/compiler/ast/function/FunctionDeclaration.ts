import { SyntaxKind, ts } from "@ts-morph/common";
import { removeOverloadableStatementedNodeChild } from "../../../manipulation";
import * as getStructureFuncs from "../../../manipulation/helpers/getStructureFunctions";
import { FunctionDeclarationOverloadStructure, FunctionDeclarationOverloadSpecificStructure, FunctionDeclarationStructure,
    FunctionDeclarationSpecificStructure, StructureKind, OptionalKind } from "../../../structures";
import { AmbientableNode, AsyncableNode, BodyableNode, ExportableNode, GeneratorableNode, ModifierableNode, NameableNode, TextInsertableNode, UnwrappableNode,
    SignaturedDeclaration, TypeParameteredNode, JSDocableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Statement } from "../statement";
import { NamespaceChildableNode } from "../module";
import { FunctionLikeDeclaration } from "./FunctionLikeDeclaration";
import { insertOverloads, OverloadableNode } from "./OverloadableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

const createBase = <T extends typeof Statement>(ctor: T) => UnwrappableNode(TextInsertableNode(OverloadableNode(
    BodyableNode(AsyncableNode(GeneratorableNode(AmbientableNode(ExportableNode(FunctionLikeDeclaration(
        NamespaceChildableNode(NameableNode(ctor))
    ))))))
)));
export const FunctionDeclarationBase = createBase(Statement);
const createOverloadBase = <T extends typeof Statement>(ctor: T) => UnwrappableNode(TextInsertableNode(
    AsyncableNode(GeneratorableNode(SignaturedDeclaration(AmbientableNode(NamespaceChildableNode(JSDocableNode(
        TypeParameteredNode(ExportableNode(ModifierableNode(ctor)))
    ))))))
));
export const FunctionDeclarationOverloadBase = createOverloadBase(Statement);

export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
    /**
     * Adds a function overload.
     * @param structure - Structure of the overload.
     */
    addOverload(structure: OptionalKind<FunctionDeclarationOverloadStructure>) {
        return this.addOverloads([structure])[0];
    }

    /**
     * Adds function overloads.
     * @param structures - Structures of the overloads.
     */
    addOverloads(structures: ReadonlyArray<OptionalKind<FunctionDeclarationOverloadStructure>>) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }

    /**
     * Inserts a function overload.
     * @param index - Child index to insert at.
     * @param structure - Structure of the overload.
     */
    insertOverload(index: number, structure: OptionalKind<FunctionDeclarationOverloadStructure>) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts function overloads.
     * @param index - Child index to insert at.
     * @param structure - Structures of the overloads.
     */
    insertOverloads(index: number, structures: ReadonlyArray<OptionalKind<FunctionDeclarationOverloadStructure>>) {
        const thisName = this.getName();
        const printer = this._context.structurePrinterFactory.forFunctionDeclaration({
            isAmbient: this.isAmbient()
        });

        return insertOverloads<FunctionDeclaration, OptionalKind<FunctionDeclarationOverloadStructure>>({
            node: this,
            index,
            structures,
            printStructure: (writer, structure) => {
                printer.printOverload(writer, thisName, structure);
            },
            getThisStructure: getStructureFuncs.fromFunctionDeclarationOverload,
            expectedSyntaxKind: SyntaxKind.FunctionDeclaration
        });
    }

    /**
     * Removes this function declaration.
     */
    remove() {
        removeOverloadableStatementedNodeChild(this);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<FunctionDeclarationStructure>) {
        callBaseSet(FunctionDeclarationBase.prototype, this, structure);

        if (structure.overloads != null) {
            this.getOverloads().forEach(o => o.remove());
            this.addOverloads(structure.overloads);
        }

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): FunctionDeclarationStructure | FunctionDeclarationOverloadStructure {
        const isOverload = this.isOverload();
        const hasImplementation = this.getImplementation();
        const basePrototype = isOverload && hasImplementation ? FunctionDeclarationOverloadBase.prototype : FunctionDeclarationBase.prototype;

        return callBaseGetStructure<any>(basePrototype, this, getStructure(this));

        function getStructure(thisNode: FunctionDeclaration) {
            if (hasImplementation && isOverload)
                return getOverloadSpecificStructure();
            return getSpecificStructure();

            function getOverloadSpecificStructure(): FunctionDeclarationOverloadSpecificStructure {
                return { kind: StructureKind.FunctionOverload };
            }

            function getSpecificStructure(): FunctionDeclarationSpecificStructure {
                if (!hasImplementation)
                    return { kind: StructureKind.Function };
                else {
                    return {
                        kind: StructureKind.Function,
                        overloads: thisNode.getOverloads().map(o => o.getStructure() as FunctionDeclarationOverloadStructure)
                    };
                }
            }
        }
    }
}
