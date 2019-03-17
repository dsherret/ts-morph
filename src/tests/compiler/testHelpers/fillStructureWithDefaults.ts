import { NamespaceDeclarationStructure, VariableStatementStructure, OptionalKind, StructureKind, VariableDeclarationStructure, ImportDeclarationStructure, ClassDeclarationStructure, ImportSpecifierStructure, EnumDeclarationStructure, InterfaceDeclarationStructure, FunctionDeclarationStructure, TypeAliasDeclarationStructure } from "../../../structures";

export namespace fillStructures {
    export function namespaceDeclaration(structure: OptionalKind<NamespaceDeclarationStructure>): NamespaceDeclarationStructure {
        return {
            kind: StructureKind.Namespace,
            ...structure
        };
    }

    export function variableStatement(structure: OptionalKind<VariableStatementStructure>): VariableStatementStructure {
        return {
            kind: StructureKind.VariableStatement,
            ...structure
        };
    }

    export function variableDeclaration(structure: VariableDeclarationStructure) {

        return structure;
    }

    export function importDeclaration(structure: OptionalKind<ImportDeclarationStructure>): ImportDeclarationStructure {
        return {
            kind: StructureKind.ImportDeclaration,
            ...structure
        };
    }

    export function importSpecifier(structure: ImportSpecifierStructure) {
        return structure;
    }

    export function classDeclaration(structure: OptionalKind<ClassDeclarationStructure>): ClassDeclarationStructure {
        return {
            kind: StructureKind.Class,
            ...structure
        };
    }

    export function enumDeclaration(structure: OptionalKind<EnumDeclarationStructure>): EnumDeclarationStructure {
        return {
            kind: StructureKind.Enum,
            ...structure
        };
    }

    export function interfaceDeclaration(structure: OptionalKind<InterfaceDeclarationStructure>): InterfaceDeclarationStructure {
        return {
            kind: StructureKind.Interface,
            ...structure
        };
    }

    export function functionDeclaration(structure: OptionalKind<FunctionDeclarationStructure>): FunctionDeclarationStructure {
        return {
            kind: StructureKind.Function,
            ...structure
        };
    }

    export function typeAlias(structure: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclarationStructure {
        return {
            kind: StructureKind.TypeAlias,
            ...structure
        };
    }
}