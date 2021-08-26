import { ts } from "@ts-morph/common";
import { ClassStaticBlockDeclarationSpecificStructure, ClassStaticBlockDeclarationStructure, StructureKind } from "../../../structures";
import { BodiedNode, ChildOrderableNode, JSDocableNode, TextInsertableNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { StatementedNode } from "../statement";
import { ClassElement } from "./ClassElement";

const createBase = <T extends typeof ClassElement>(ctor: T) => ChildOrderableNode(TextInsertableNode(StatementedNode(JSDocableNode(BodiedNode(ctor)))));
export const ClassStaticBlockDeclarationBase = createBase(ClassElement);
export class ClassStaticBlockDeclaration extends ClassStaticBlockDeclarationBase<ts.ClassStaticBlockDeclaration> {
    /**
     * Method that exists for the sake of making code compile that looks for the name of static members.
     * This always returns "static".
     */
    getName() {
        return "static" as const;
    }

    /**
     * Method that exists for the sake of making code compile that looks for this method on class members.
     * This always returns true.
     */
    isStatic() {
        return true as const;
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ClassStaticBlockDeclarationStructure>) {
        callBaseSet(ClassStaticBlockDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ClassStaticBlockDeclarationStructure {
        return callBaseGetStructure<ClassStaticBlockDeclarationSpecificStructure>(
            ClassStaticBlockDeclarationBase.prototype,
            this,
            {
                kind: StructureKind.ClassStaticBlock,
            },
        ) as ClassStaticBlockDeclarationStructure;
    }
}
