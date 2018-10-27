import { ClassDeclarationStructure, ConstructorDeclarationStructure, MethodDeclarationStructure, ClassDeclarationSpecificStructure,
    InterfaceDeclarationStructure } from "../../../structures";
import { ts } from "../../../typescript";
import { ArrayUtils, StringUtils, TypeGuards, KeyValueCache } from "../../../utils";
import { ChildOrderableNode, ExportableNode, AmbientableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { NamespaceChildableNode } from "../module";
import { Statement } from "../statement";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ClassLikeDeclarationBase } from "./base";
import { Scope } from "../common";
import { ConstructorDeclaration } from "./ConstructorDeclaration";
import { GetAccessorDeclaration } from "./GetAccessorDeclaration";
import { SetAccessorDeclaration } from "./SetAccessorDeclaration";

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

    /**
     * Extracts an interface declaration structure from the class' type.
     * @param name Name of the interface. Falls back to the same name as the class and then the filepath's base name.
     */
    extractInterface(name?: string): InterfaceDeclarationStructure {
        name = StringUtils.isNullOrWhitespace(name) ? undefined : name;
        const constructors = ArrayUtils.flatten(this.getConstructors().map(c => c.getOverloads().length > 0 ? c.getOverloads() : [c]));
        const parameterProperties = ArrayUtils.flatten(constructors.map(c => c.getParameters().filter(p => p.isParameterProperty())))
            .filter(p => p.getName() != null && p.getScope() === Scope.Public);
        const properties = this.getProperties().filter(p => !p.isStatic() && p.getScope() === Scope.Public);
        const methods = ArrayUtils.flatten(this.getMethods()
            .filter(p => !p.isStatic() && p.getScope() === Scope.Public)
            .map(m => m.getOverloads().length > 0 ? m.getOverloads() : [m]));
        const accessors = getAccessors(this);

        return {
            name: name || this.getName() || this.getSourceFile().getBaseNameWithoutExtension().replace(/[^a-zA-Z0-9_$]/g, ""),
            docs: this.getJsDocs().map(d => d.getStructure()),
            typeParameters: this.getTypeParameters().map(p => p.getStructure()),
            properties: [
                ...parameterProperties.map(p => {
                    const jsDocComment = ArrayUtils.flatten((p.getParentOrThrow() as ConstructorDeclaration).getJsDocs().map(j => j.getTags()))
                                .filter(TypeGuards.isJSDocParameterTag)
                                .filter(t => t.getTagName() === "param" && t.getName() === p.getName() && t.getComment() != null)
                                .map(t => t.getComment()!.trim())[0];
                    return {
                        docs: jsDocComment == null ? [] : [{ description: jsDocComment }],
                        name: p.getName()!,
                        type: p.getType().getText(p),
                        hasQuestionToken: p.hasQuestionToken(),
                        isReadonly: p.isReadonly()
                    };
                }),
                ...properties.map(p => ({
                    docs: p.getJsDocs().map(d => d.getStructure()),
                    name: p.getName()!,
                    type: p.getType().getText(p),
                    hasQuestionToken: p.hasQuestionToken(),
                    isReadonly: p.isReadonly()
                })),
                ...accessors.map(getAndSet => ({
                    docs: getAndSet[0].getJsDocs().map(d => d.getStructure()),
                    name: getAndSet[0].getName(),
                    type: getAndSet[0].getType().getText(getAndSet[0]),
                    hasQuestionToken: false,
                    isReadonly: getAndSet.every(TypeGuards.isGetAccessorDeclaration)
                }))
            ],
            methods: [
                ...methods.map(m => ({
                    docs: m.getJsDocs().map(d => d.getStructure()),
                    name: m.getName(),
                    hasQuestionToken: m.hasQuestionToken(),
                    returnType: m.getReturnType().getText(m),
                    parameters: m.getParameters().map(p => p.getStructure()),
                    typeParameters: m.getTypeParameters().map(p => p.getStructure())
                }))
            ]
        };

        function getAccessors(thisNode: ClassDeclaration) {
            type GetOrSetArray = (GetAccessorDeclaration | SetAccessorDeclaration)[];
            const result = new KeyValueCache<string, GetOrSetArray>();

            for (const accessor of [...thisNode.getGetAccessors(), ...thisNode.getSetAccessors()]) {
                if (accessor.getScope() === Scope.Public)
                    result.getOrCreate<GetOrSetArray>(accessor.getName(), () => []).push(accessor);
            }

            return result.getValuesAsArray();
        }
    }
}
