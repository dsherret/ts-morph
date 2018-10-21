import { ClassDeclarationStructure, ConstructorDeclarationStructure, MethodDeclarationStructure, ClassDeclarationSpecificStructure } from "../../../structures";
import { ts } from "../../../typescript";
import { ChildOrderableNode, ExportableNode, AmbientableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { NamespaceChildableNode } from "../module";
import { Statement } from "../statement";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ClassLikeDeclarationBase } from "./base";

export const ClassDeclarationBase = ChildOrderableNode(NamespaceChildableNode(AmbientableNode(ExportableNode(ClassLikeDeclarationBase(Statement)))));
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ClassDeclarationStructure>) {
        callBaseSet(ClassDeclarationBase.prototype, this, structure);

        if (structure.extends != null)
            this.setExtends(structure.extends);
        else if (structure.hasOwnProperty(nameof(structure.extends)))
            this.removeExtends();

        if (structure.ctors != null) {
            this.getConstructors().forEach(c => c.remove());
            this.addConstructors(structure.ctors);
        }
        if (structure.properties != null) {
            this.getProperties().forEach(p => p.remove());
            this.addProperties(structure.properties);
        }
        if (structure.getAccessors != null) {
            this.getGetAccessors().forEach(a => a.remove());
            this.addGetAccessors(structure.getAccessors);
        }
        if (structure.setAccessors != null) {
            this.getSetAccessors().forEach(a => a.remove());
            this.addSetAccessors(structure.setAccessors);
        }
        if (structure.methods != null) {
            this.getMethods().forEach(m => m.remove());
            this.addMethods(structure.methods);
        }

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ClassDeclarationStructure {
        const getExtends = this.getExtends();
        const isAmbient = this.isAmbient();
        return callBaseGetStructure<ClassDeclarationSpecificStructure>(ClassDeclarationBase.prototype, this, {
            ctors: this.getConstructors().filter(ctor => isAmbient || !ctor.isOverload()).map(ctor => ctor.getStructure() as ConstructorDeclarationStructure),
            methods: this.getMethods().filter(method => isAmbient || !method.isOverload()).map(method => method.getStructure() as MethodDeclarationStructure),
            properties: this.getProperties().map(property => property.getStructure()),
            extends: getExtends ? getExtends.getText() : undefined,
            getAccessors: this.getGetAccessors().map(getAccessor => getAccessor.getStructure()),
            setAccessors: this.getSetAccessors().map(accessor => accessor.getStructure())
        }) as any as ClassDeclarationStructure;
    }
}
