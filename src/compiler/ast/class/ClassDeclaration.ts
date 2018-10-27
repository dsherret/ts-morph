import { ClassDeclarationStructure, ConstructorDeclarationStructure, MethodDeclarationStructure, ClassDeclarationSpecificStructure,
    InterfaceDeclarationStructure, PropertyDeclarationStructure, ParameterDeclarationStructure } from "../../../structures";
import { ts } from "../../../typescript";
import { ArrayUtils, StringUtils, TypeGuards, KeyValueCache } from "../../../utils";
import { ChildOrderableNode, ExportableNode, AmbientableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { NamespaceChildableNode } from "../module";
import { Statement } from "../statement";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ClassLikeDeclarationBase } from "./base";
import { Scope } from "../common";
import { ParameterDeclaration } from "../function";
import { PropertyDeclaration } from "./PropertyDeclaration";
import { ConstructorDeclaration } from "./ConstructorDeclaration";
import { GetAccessorDeclaration } from "./GetAccessorDeclaration";
import { MethodDeclaration } from "./MethodDeclaration";
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
     * Extracts an interface declaration structure from the class.
     * @param name - Name of the interface. Falls back to the same name as the class and then the filepath's base name.
     */
    extractInterface(name?: string): InterfaceDeclarationStructure {
        const { constructors, properties, methods, accessors } = getExtractedClassDetails(this, false);
        const parameterProperties = ArrayUtils.flatten(constructors.map(c => c.getParameters().filter(p => p.isParameterProperty())))
            .filter(p => p.getName() != null && p.getScope() === Scope.Public);

        return {
            name: getDefaultExtractedName(name, this),
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
                ...properties.map(getExtractedInterfacePropertyStructure),
                ...accessors.map(getExtractedInterfaceAccessorStructure)
            ],
            methods: methods.map(getExtractedInterfaceMethodStructure)
        };
    }

    /**
     * Extracts an interface declaration structure from the static part of the class.
     * @param name - Name of the interface.
     */
    extractStaticInterface(name: string): InterfaceDeclarationStructure {
        const { constructors, properties, methods, accessors } = getExtractedClassDetails(this, true);
        const instanceName = getDefaultExtractedName(undefined, this);

        return {
            name,
            properties: [
                ...properties.map(getExtractedInterfacePropertyStructure),
                ...accessors.map(getExtractedInterfaceAccessorStructure)
            ],
            methods: methods.map(getExtractedInterfaceMethodStructure),
            constructSignatures: constructors.map(c => ({
                docs: c.getJsDocs().map(d => d.getStructure()),
                parameters: c.getParameters().map(p => ({
                    ...getExtractedInterfaceParameterStructure(p),
                    scope: undefined,
                    isReadonly: false
                })),
                returnType: instanceName
            }))
        };
    }
}

function getExtractedClassDetails(classDec: ClassDeclaration, isStatic: boolean) {
    const constructors = ArrayUtils.flatten(classDec.getConstructors().map(c => c.getOverloads().length > 0 ? c.getOverloads() : [c]));
    const properties = classDec.getProperties().filter(p => p.isStatic() === isStatic && p.getScope() === Scope.Public);
    const methods = ArrayUtils.flatten(classDec.getMethods()
        .filter(p => p.isStatic() === isStatic && p.getScope() === Scope.Public)
        .map(m => m.getOverloads().length > 0 ? m.getOverloads() : [m]));

    return { constructors, properties, methods, accessors: getAccessors() };

    function getAccessors() {
        type GetOrSetArray = (GetAccessorDeclaration | SetAccessorDeclaration)[];
        const result = new KeyValueCache<string, GetOrSetArray>();

        for (const accessor of [...classDec.getGetAccessors(), ...classDec.getSetAccessors()]) {
            if (accessor.isStatic() === isStatic && accessor.getScope() === Scope.Public)
                result.getOrCreate<GetOrSetArray>(accessor.getName(), () => []).push(accessor);
        }

        return result.getValuesAsArray();
    }
}

function getDefaultExtractedName(name: string | undefined, classDec: ClassDeclaration) {
    name = StringUtils.isNullOrWhitespace(name) ? undefined : name;
    return name || classDec.getName() || classDec.getSourceFile().getBaseNameWithoutExtension().replace(/[^a-zA-Z0-9_$]/g, "");
}

function getExtractedInterfacePropertyStructure(prop: PropertyDeclaration): PropertyDeclarationStructure {
    return {
        docs: prop.getJsDocs().map(d => d.getStructure()),
        name: prop.getName()!,
        type: prop.getType().getText(prop),
        hasQuestionToken: prop.hasQuestionToken(),
        isReadonly: prop.isReadonly()
    };
}

function getExtractedInterfaceAccessorStructure(getAndSet: (GetAccessorDeclaration | SetAccessorDeclaration)[]): PropertyDeclarationStructure {
    return {
        docs: getAndSet[0].getJsDocs().map(d => d.getStructure()),
        name: getAndSet[0].getName(),
        type: getAndSet[0].getType().getText(getAndSet[0]),
        hasQuestionToken: false,
        isReadonly: getAndSet.every(TypeGuards.isGetAccessorDeclaration)
    };
}

function getExtractedInterfaceMethodStructure(method: MethodDeclaration): MethodDeclarationStructure {
    return {
        docs: method.getJsDocs().map(d => d.getStructure()),
        name: method.getName(),
        hasQuestionToken: method.hasQuestionToken(),
        returnType: method.getReturnType().getText(method),
        parameters: method.getParameters().map(getExtractedInterfaceParameterStructure),
        typeParameters: method.getTypeParameters().map(p => p.getStructure())
    };
}

function getExtractedInterfaceParameterStructure(param: ParameterDeclaration): ParameterDeclarationStructure {
    return {
        ...param.getStructure(),
        decorators: []
    };
}
