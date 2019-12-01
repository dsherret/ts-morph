import { NamespaceDeclarationStructure, VariableStatementStructure, OptionalKind, StructureKind, VariableDeclarationStructure, ImportDeclarationStructure,
    ClassDeclarationStructure, ImportSpecifierStructure, EnumDeclarationStructure, InterfaceDeclarationStructure, FunctionDeclarationStructure,
    TypeAliasDeclarationStructure, PropertyDeclarationStructure, TypeParameterDeclarationStructure, ParameterDeclarationStructure, JSDocStructure,
    PropertySignatureStructure, MethodSignatureStructure, CallSignatureDeclarationStructure, IndexSignatureDeclarationStructure,
    ConstructSignatureDeclarationStructure, FunctionDeclarationOverloadStructure, EnumMemberStructure, MethodDeclarationStructure,
    MethodDeclarationOverloadStructure, SetAccessorDeclarationStructure, GetAccessorDeclarationStructure, DecoratorStructure, ConstructorDeclarationStructure,
    ConstructorDeclarationOverloadStructure, JSDocTagStructure } from "../../../structures";
import { NamespaceDeclarationKind, VariableDeclarationKind } from "../../../compiler";

// this file is incomplete... update accordingly as needed

export namespace fillStructures {
    export function namespaceDeclaration(structure: OptionalKind<NamespaceDeclarationStructure>): NamespaceDeclarationStructure {
        setIfNull(structure, "declarationKind", NamespaceDeclarationKind.Namespace);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);

        fill(structure.docs!, jsDoc);

        setIfNull(structure, "kind", StructureKind.Namespace);
        return structure as NamespaceDeclarationStructure;
    }

    export function variableStatement(structure: OptionalKind<VariableStatementStructure>): VariableStatementStructure {
        setIfNull(structure, "declarationKind", VariableDeclarationKind.Let);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);

        fill(structure.docs!, jsDoc);
        fill(structure.declarations, variableDeclaration);

        setIfNull(structure, "kind", StructureKind.VariableStatement);
        return structure as VariableStatementStructure;
    }

    export function variableDeclaration(structure: OptionalKind<VariableDeclarationStructure>): VariableDeclarationStructure {
        setIfNull(structure, "hasExclamationToken", false);
        setIfNull(structure, "initializer", undefined);
        setIfNull(structure, "type", undefined);

        setIfNull(structure, "kind", StructureKind.VariableDeclaration);
        return structure as VariableDeclarationStructure;
    }

    export function importDeclaration(structure: OptionalKind<ImportDeclarationStructure>): ImportDeclarationStructure {
        setIfNull(structure, "defaultImport", undefined);
        setIfNull(structure, "namespaceImport", undefined);

        setIfNull(structure, "kind", StructureKind.ImportDeclaration);
        return structure as ImportDeclarationStructure;
    }

    export function importSpecifier(structure: OptionalKind<ImportSpecifierStructure>): ImportSpecifierStructure {
        setIfNull(structure, "alias", undefined);

        setIfNull(structure, "kind", StructureKind.ImportSpecifier);
        return structure as ImportSpecifierStructure;
    }

    export function classDeclaration(structure: OptionalKind<ClassDeclarationStructure>): ClassDeclarationStructure {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isAbstract", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);
        setIfNull(structure, "ctors", []);
        setIfNull(structure, "decorators", []);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "extends", undefined);
        setIfNull(structure, "implements", []);
        setIfNull(structure, "getAccessors", []);
        setIfNull(structure, "methods", []);
        setIfNull(structure, "properties", []);
        setIfNull(structure, "setAccessors", []);
        setIfNull(structure, "typeParameters", []);

        fill(structure.docs!, jsDoc);
        fill(structure.decorators!, decorator);
        fill(structure.typeParameters!, typeParameter);
        fill(structure.ctors!, constructorDeclaration);
        fill(structure.methods!, method);
        fill(structure.properties!, property);
        fill(structure.getAccessors!, getAccessor);
        fill(structure.setAccessors!, setAccessor);

        setIfNull(structure, "kind", StructureKind.Class);
        return structure as ClassDeclarationStructure;
    }

    export function constructorDeclaration(structure: OptionalKind<ConstructorDeclarationStructure>): ConstructorDeclarationStructure {
        constructorBase(structure);
        setIfNull(structure, "statements", undefined);

        if (structure.overloads)
            fill(structure.overloads, constructorDeclarationOverload);

        setIfNull(structure, "kind", StructureKind.Constructor);
        return structure as ConstructorDeclarationStructure;
    }

    export function constructorDeclarationOverload(structure: OptionalKind<ConstructorDeclarationOverloadStructure>): ConstructorDeclarationOverloadStructure {
        constructorBase(structure);

        setIfNull(structure, "kind", StructureKind.ConstructorOverload);
        return structure as ConstructorDeclarationOverloadStructure;
    }

    function constructorBase(structure: OptionalKind<ConstructorDeclarationStructure | ConstructorDeclarationOverloadStructure>) {
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "typeParameters", []);
        setIfNull(structure, "scope", undefined);
        setIfNull(structure, "returnType", undefined);

        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);
    }

    export function enumDeclaration(structure: OptionalKind<EnumDeclarationStructure>): EnumDeclarationStructure {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isConst", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "members", []);

        fill(structure.docs!, jsDoc);
        fill(structure.members!, enumMember);

        setIfNull(structure, "kind", StructureKind.Enum);
        return structure as EnumDeclarationStructure;
    }

    export function enumMember(structure: OptionalKind<EnumMemberStructure>): EnumMemberStructure {
        setIfNull(structure, "docs", []);
        setIfNull(structure, "initializer", undefined);
        setIfNull(structure, "value", undefined);

        fill(structure.docs!, jsDoc);

        setIfNull(structure, "kind", StructureKind.EnumMember);
        return structure as EnumMemberStructure;
    }

    export function interfaceDeclaration(structure: OptionalKind<InterfaceDeclarationStructure>): InterfaceDeclarationStructure {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "callSignatures", []);
        setIfNull(structure, "constructSignatures", []);
        setIfNull(structure, "extends", []);
        setIfNull(structure, "indexSignatures", []);
        setIfNull(structure, "properties", []);
        setIfNull(structure, "methods", []);
        setIfNull(structure, "typeParameters", []);

        fill(structure.docs!, jsDoc);
        fill(structure.typeParameters!, typeParameter);
        fill(structure.methods!, methodSignature);
        fill(structure.properties!, propertySignature);
        fill(structure.callSignatures!, callSignature);
        fill(structure.indexSignatures!, indexSignature);
        fill(structure.constructSignatures!, constructSignature);

        setIfNull(structure, "kind", StructureKind.Interface);
        return structure as InterfaceDeclarationStructure;
    }

    export function callSignature(structure: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclarationStructure {
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "typeParameters", []);

        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);

        setIfNull(structure, "kind", StructureKind.CallSignature);
        return structure as CallSignatureDeclarationStructure;
    }

    export function indexSignature(structure: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclarationStructure {
        setIfNull(structure, "docs", []);
        setIfNull(structure, "isReadonly", false);
        setIfNull(structure, "keyType", "string");
        setIfNull(structure, "keyType", "string");
        setIfNull(structure, "keyName", "key");

        fill(structure.docs!, jsDoc);

        setIfNull(structure, "kind", StructureKind.IndexSignature);
        return structure as IndexSignatureDeclarationStructure;
    }

    export function constructSignature(structure: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclarationStructure {
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "typeParameters", []);

        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);

        setIfNull(structure, "kind", StructureKind.ConstructSignature);
        return structure as ConstructSignatureDeclarationStructure;
    }

    export function functionDeclaration(structure: OptionalKind<FunctionDeclarationStructure>): FunctionDeclarationStructure {
        functionBase(structure);

        if (structure.overloads)
            fill(structure.overloads, functionDeclarationOverload);

        setIfNull(structure, "kind", StructureKind.Function);
        return structure as FunctionDeclarationStructure;
    }

    export function functionDeclarationOverload(structure: OptionalKind<FunctionDeclarationOverloadStructure>): FunctionDeclarationOverloadStructure {
        functionBase(structure);

        setIfNull(structure, "kind", StructureKind.FunctionOverload);
        return structure as FunctionDeclarationOverloadStructure;
    }

    function functionBase(structure: OptionalKind<FunctionDeclarationStructure | FunctionDeclarationOverloadStructure>) {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isAsync", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);
        setIfNull(structure, "isGenerator", false);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "returnType", undefined);
        setIfNull(structure, "typeParameters", []);

        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);
    }

    export function typeAlias(structure: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclarationStructure {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "typeParameters", []);

        fill(structure.docs!, jsDoc);
        fill(structure.typeParameters!, typeParameter);

        setIfNull(structure, "kind", StructureKind.TypeAlias);
        return structure as TypeAliasDeclarationStructure;
    }

    export function method(structure: OptionalKind<MethodDeclarationStructure>): MethodDeclarationStructure {
        methodBase(structure);
        setIfNull(structure, "decorators", []);
        setIfNull(structure, "statements", undefined);

        if (structure.overloads)
            fill(structure.overloads, methodOverload);

        fill(structure.decorators!, decorator);

        setIfNull(structure, "kind", StructureKind.Method);
        return structure as MethodDeclarationStructure;
    }

    export function methodOverload(structure: OptionalKind<MethodDeclarationOverloadStructure>): MethodDeclarationOverloadStructure {
        methodBase(structure);

        setIfNull(structure, "kind", StructureKind.MethodOverload);
        return structure as MethodDeclarationOverloadStructure;
    }

    function methodBase(structure: OptionalKind<MethodDeclarationStructure | MethodDeclarationOverloadStructure>) {
        setIfNull(structure, "isGenerator", false);
        setIfNull(structure, "isStatic", false);
        setIfNull(structure, "isAsync", false);
        setIfNull(structure, "isAbstract", false);
        setIfNull(structure, "hasQuestionToken", false);
        setIfNull(structure, "scope", undefined);
        setIfNull(structure, "returnType", undefined);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "typeParameters", []);

        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);
    }

    export function methodSignature(structure: OptionalKind<MethodSignatureStructure>): MethodSignatureStructure {
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "typeParameters", []);
        setIfNull(structure, "hasQuestionToken", false);

        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);

        setIfNull(structure, "kind", StructureKind.MethodSignature);
        return structure as MethodSignatureStructure;
    }

    export function property(structure: OptionalKind<PropertyDeclarationStructure>): PropertyDeclarationStructure {
        setIfNull(structure, "decorators", []);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "scope", undefined);
        setIfNull(structure, "isStatic", false);
        setIfNull(structure, "isReadonly", false);
        setIfNull(structure, "isAbstract", false);
        setIfNull(structure, "hasExclamationToken", false);
        setIfNull(structure, "hasQuestionToken", false);
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "initializer", undefined);
        setIfNull(structure, "scope", undefined);

        fill(structure.docs!, jsDoc);
        fill(structure.decorators!, decorator);

        setIfNull(structure, "kind", StructureKind.Property);
        return structure as PropertyDeclarationStructure;
    }

    export function propertySignature(structure: OptionalKind<PropertySignatureStructure>): PropertySignatureStructure {
        setIfNull(structure, "docs", []);
        setIfNull(structure, "isReadonly", false);
        setIfNull(structure, "hasQuestionToken", false);
        setIfNull(structure, "initializer", undefined);

        fill(structure.docs!, jsDoc);

        setIfNull(structure, "kind", StructureKind.PropertySignature);
        return structure as PropertySignatureStructure;
    }

    export function getAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclarationStructure {
        setIfNull(structure, "decorators", []);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "typeParameters", []);
        setIfNull(structure, "isAbstract", false);
        setIfNull(structure, "isStatic", false);
        setIfNull(structure, "returnType", undefined);
        setIfNull(structure, "statements", undefined);
        setIfNull(structure, "scope", undefined);

        fill(structure.decorators!, decorator);
        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);

        setIfNull(structure, "kind", StructureKind.GetAccessor);
        return structure as GetAccessorDeclarationStructure;
    }

    export function setAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclarationStructure {
        setIfNull(structure, "decorators", []);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "typeParameters", []);
        setIfNull(structure, "isAbstract", false);
        setIfNull(structure, "isStatic", false);
        setIfNull(structure, "returnType", undefined);
        setIfNull(structure, "statements", undefined);
        setIfNull(structure, "scope", undefined);

        fill(structure.decorators!, decorator);
        fill(structure.docs!, jsDoc);
        fill(structure.parameters!, parameter);
        fill(structure.typeParameters!, typeParameter);

        setIfNull(structure, "kind", StructureKind.SetAccessor);
        return structure as SetAccessorDeclarationStructure;
    }

    export function parameter(structure: OptionalKind<ParameterDeclarationStructure> | string): ParameterDeclarationStructure {
        if (typeof structure === "string")
            structure = { name: structure };

        setIfNull(structure, "decorators", []);
        setIfNull(structure, "hasQuestionToken", false);
        setIfNull(structure, "initializer", undefined);
        setIfNull(structure, "isReadonly", false);
        setIfNull(structure, "isRestParameter", false);
        setIfNull(structure, "scope", undefined);
        setIfNull(structure, "type", undefined);

        setIfNull(structure, "kind", StructureKind.Parameter);
        return structure as ParameterDeclarationStructure;
    }

    export function decorator(structure: OptionalKind<DecoratorStructure>): DecoratorStructure {
        setIfNull(structure, "typeArguments", undefined);
        setIfNull(structure, "arguments", undefined);

        setIfNull(structure, "kind", StructureKind.Decorator);
        return structure as DecoratorStructure;
    }

    export function typeParameter(structure: OptionalKind<TypeParameterDeclarationStructure> | string): TypeParameterDeclarationStructure {
        if (typeof structure === "string")
            structure = { name: structure };

        setIfNull(structure, "constraint", undefined);
        setIfNull(structure, "default", undefined);

        setIfNull(structure, "kind", StructureKind.TypeParameter);
        return structure as TypeParameterDeclarationStructure;
    }

    export function jsDoc(structure: OptionalKind<JSDocStructure>): JSDocStructure {
        setIfNull(structure, "kind", StructureKind.JSDoc);
        setIfNull(structure, "tags", []);

        fill(structure.tags!, jsDocTag);

        return structure as JSDocStructure;
    }

    export function jsDocTag(structure: OptionalKind<JSDocTagStructure>): JSDocTagStructure {
        setIfNull(structure, "kind", StructureKind.JSDocTag);
        return structure as JSDocTagStructure;
    }
}

function setIfNull<T, TKey extends keyof T>(structure: T, key: TKey, value: T[TKey]) {
    if (structure[key] == null)
        structure[key] = value;
}

function fill<T>(items: (OptionalKind<T> | string)[], fillItem: (item: OptionalKind<T>) => T) {
    if (items == null)
        throw new Error("Did not expect an undefined array.");

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item !== "string")
            items[i] = fillItem(item);
    }
}
