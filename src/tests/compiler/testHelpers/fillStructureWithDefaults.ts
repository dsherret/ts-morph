import { NamespaceDeclarationStructure, VariableStatementStructure, OptionalKind, StructureKind, VariableDeclarationStructure, ImportDeclarationStructure,
    ClassDeclarationStructure, ImportSpecifierStructure, EnumDeclarationStructure, InterfaceDeclarationStructure, FunctionDeclarationStructure,
    TypeAliasDeclarationStructure, PropertyDeclarationStructure } from "../../../structures";
import { NamespaceDeclarationKind, VariableDeclarationKind } from "../../../compiler";

// this file is incomplete... update accordingly as needed

export namespace fillStructures {
    export function namespaceDeclaration(structure: OptionalKind<NamespaceDeclarationStructure>): NamespaceDeclarationStructure {
        setIfNull(structure, "declarationKind", NamespaceDeclarationKind.Namespace);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);

        return {
            kind: StructureKind.Namespace,
            ...structure
        };
    }

    export function variableStatement(structure: OptionalKind<VariableStatementStructure>): VariableStatementStructure {
        setIfNull(structure, "declarationKind", VariableDeclarationKind.Let);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);

        return {
            kind: StructureKind.VariableStatement,
            ...structure
        };
    }

    export function variableDeclaration(structure: VariableDeclarationStructure) {
        setIfNull(structure, "hasExclamationToken", false);
        setIfNull(structure, "initializer", undefined);
        setIfNull(structure, "type", undefined);
        return structure;
    }

    export function importDeclaration(structure: OptionalKind<ImportDeclarationStructure>): ImportDeclarationStructure {
        setIfNull(structure, "defaultImport", undefined);
        setIfNull(structure, "namespaceImport", undefined);

        return {
            kind: StructureKind.ImportDeclaration,
            ...structure
        };
    }

    export function importSpecifier(structure: ImportSpecifierStructure) {
        setIfNull(structure, "alias", undefined);

        return structure;
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

        return {
            kind: StructureKind.Class,
            ...structure
        };
    }

    export function enumDeclaration(structure: OptionalKind<EnumDeclarationStructure>): EnumDeclarationStructure {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isConst", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "members", []);

        return {
            kind: StructureKind.Enum,
            ...structure
        };
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

        return {
            kind: StructureKind.Interface,
            ...structure
        };
    }

    export function functionDeclaration(structure: OptionalKind<FunctionDeclarationStructure>): FunctionDeclarationStructure {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isAsync", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "isExported", false);
        setIfNull(structure, "isGenerator", false);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "overloads", []);
        setIfNull(structure, "parameters", []);
        setIfNull(structure, "returnType", undefined);
        setIfNull(structure, "statements", []);
        setIfNull(structure, "typeParameters", []);

        return {
            kind: StructureKind.Function,
            ...structure
        };
    }

    export function typeAlias(structure: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclarationStructure {
        setIfNull(structure, "hasDeclareKeyword", false);
        setIfNull(structure, "isDefaultExport", false);
        setIfNull(structure, "docs", []);
        setIfNull(structure, "typeParameters", []);

        return {
            kind: StructureKind.TypeAlias,
            ...structure
        };
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
        setIfNull(structure, "initializer", undefined);

        return {
            kind: StructureKind.Property,
            ...structure
        };
    }
}

function setIfNull<T, TKey extends keyof T>(structure: T, key: TKey, value: T[TKey]) {
    if (structure[key] == null)
        structure[key] = value;
}
