import { StructureKind } from "../StructureKind";
import { Structures } from "../aliases";
import { DecoratableNodeStructure, SignaturedDeclarationStructure, ParameteredNodeStructure, TypeElementMemberedNodeStructure, TypeParameteredNodeStructure,
    JSDocableNodeStructure } from "../base";
import { ClassDeclarationStructure, GetAccessorDeclarationStructure, SetAccessorDeclarationStructure, ClassLikeDeclarationBaseStructure, ConstructorDeclarationOverloadStructure,
    MethodDeclarationStructure, MethodDeclarationOverloadStructure, PropertyDeclarationStructure, ConstructorDeclarationStructure } from "../class";
import { EnumDeclarationStructure, EnumMemberStructure } from "../enum";
import { FunctionDeclarationStructure, FunctionLikeDeclarationStructure, FunctionDeclarationOverloadStructure, ParameterDeclarationStructure } from "../function";
import { InterfaceDeclarationStructure, CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, MethodSignatureStructure,
    IndexSignatureDeclarationStructure, PropertySignatureStructure } from "../interface";
import { JsxElementStructure, JsxSelfClosingElementStructure, JsxAttributedNodeStructure } from "../jsx";
import { ExportDeclarationStructure, ImportDeclarationStructure, NamespaceDeclarationStructure, SourceFileStructure } from "../module";
import { VariableStatementStructure, StatementedNodeStructure } from "../statement";
import { TypeAliasDeclarationStructure } from "../type";
import { OptionalKind } from "../types";

/* tslint:disable */

/**
 * Iterates over the elements in the provided array.
 * @param structures - Array of structures to iterate over.
 * @param action - Action to do on each element in the array. Returning a truthy value will return that value in the main function call.
 */
export function forEachStructureChild<TStructure>(structures: Structures[], action: (child: Structures) => TStructure | void): TStructure | undefined;
/**
 * Iterates over the children of the provided array.
 * @remarks If the children do not have a `kind` property, it will be automatically added.
 * @param structure - Structure to iterate over.
 * @param action - Action to do on each child of the provided structure. Returning a truthy value will return that value in the main function call.
 */
export function forEachStructureChild<TStructure>(structure: Structures, action: (child: Structures) => TStructure | void): TStructure | undefined;
export function forEachStructureChild<TStructure>(structure: Structures | Structures[], action: (child: Structures) => TStructure | void): TStructure | undefined {
    // automatically generated: run `yarn run code-generate` to update the code in here
    if (structure instanceof Array) {
        for (const item of structure) {
            const result = action(item);
            if (result)
                return result;
        }
        return undefined;
    }

    switch (structure.kind) {
        case StructureKind.Class:
            return forClassDeclaration(structure, action);
        case StructureKind.Constructor:
            return forConstructorDeclaration(structure, action);
        case StructureKind.ConstructorOverload:
            return forConstructorDeclarationOverload(structure, action);
        case StructureKind.GetAccessor:
            return forGetAccessorDeclaration(structure, action);
        case StructureKind.Method:
            return forMethodDeclaration(structure, action);
        case StructureKind.MethodOverload:
            return forMethodDeclarationOverload(structure, action);
        case StructureKind.Property:
            return forPropertyDeclaration(structure, action);
        case StructureKind.SetAccessor:
            return forSetAccessorDeclaration(structure, action);
        case StructureKind.Enum:
            return forEnumDeclaration(structure, action);
        case StructureKind.EnumMember:
            return forEnumMember(structure, action);
        case StructureKind.Function:
            return forFunctionDeclaration(structure, action);
        case StructureKind.FunctionOverload:
            return forFunctionDeclarationOverload(structure, action);
        case StructureKind.Parameter:
            return forParameterDeclaration(structure, action);
        case StructureKind.CallSignature:
            return forCallSignatureDeclaration(structure, action);
        case StructureKind.ConstructSignature:
            return forConstructSignatureDeclaration(structure, action);
        case StructureKind.IndexSignature:
            return forIndexSignatureDeclaration(structure, action);
        case StructureKind.Interface:
            return forInterfaceDeclaration(structure, action);
        case StructureKind.MethodSignature:
            return forMethodSignature(structure, action);
        case StructureKind.PropertySignature:
            return forPropertySignature(structure, action);
        case StructureKind.JsxElement:
            return forJsxElement(structure, action);
        case StructureKind.JsxSelfClosingElement:
            return forJsxSelfClosingElement(structure, action);
        case StructureKind.ExportDeclaration:
            return forExportDeclaration(structure, action);
        case StructureKind.ImportDeclaration:
            return forImportDeclaration(structure, action);
        case StructureKind.Namespace:
            return forNamespaceDeclaration(structure, action);
        case StructureKind.SourceFile:
            return forSourceFile(structure, action);
        case StructureKind.VariableStatement:
            return forVariableStatement(structure, action);
        case StructureKind.TypeAlias:
            return forTypeAliasDeclaration(structure, action);
        default:
            return undefined;
    }
}

/**
 * @generated
 */
function forClassDeclaration<TStructure>(structure: ClassDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forClassLikeDeclarationBase(structure, action);
}

/**
 * @generated
 */
function forClassLikeDeclarationBase<TStructure>(structure: ClassLikeDeclarationBaseStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, action)
        || forTypeParameteredNode(structure, action)
        || forJSDocableNode(structure, action)
        || forAll(structure.ctors, action, StructureKind.Constructor)
        || forAll(structure.properties, action, StructureKind.Property)
        || forAll(structure.getAccessors, action, StructureKind.GetAccessor)
        || forAll(structure.setAccessors, action, StructureKind.SetAccessor)
        || forAll(structure.methods, action, StructureKind.Method);
}

/**
 * @generated
 */
function forDecoratableNode<TStructure>(structure: DecoratableNodeStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAll(structure.decorators, action, StructureKind.Decorator);
}

/**
 * @generated
 */
function forTypeParameteredNode<TStructure>(structure: TypeParameteredNodeStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.typeParameters, action, StructureKind.TypeParameter);
}

/**
 * @generated
 */
function forJSDocableNode<TStructure>(structure: JSDocableNodeStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.docs, action, StructureKind.JSDoc);
}

/**
 * @generated
 */
function forConstructorDeclaration<TStructure>(structure: ConstructorDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forFunctionLikeDeclaration(structure, action)
        || forAll(structure.overloads, action, StructureKind.ConstructorOverload);
}

/**
 * @generated
 */
function forFunctionLikeDeclaration<TStructure>(structure: FunctionLikeDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, action)
        || forTypeParameteredNode(structure, action)
        || forJSDocableNode(structure, action)
        || forStatementedNode(structure, action);
}

/**
 * @generated
 */
function forSignaturedDeclaration<TStructure>(structure: SignaturedDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forParameteredNode(structure, action);
}

/**
 * @generated
 */
function forParameteredNode<TStructure>(structure: ParameteredNodeStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAll(structure.parameters, action, StructureKind.Parameter);
}

/**
 * @generated
 */
function forStatementedNode<TStructure>(structure: StatementedNodeStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllUnknownKindIfStructure(structure.statements, action);
}

/**
 * @generated
 */
function forConstructorDeclarationOverload<TStructure>(structure: ConstructorDeclarationOverloadStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, action)
        || forTypeParameteredNode(structure, action)
        || forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forGetAccessorDeclaration<TStructure>(structure: GetAccessorDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, action)
        || forFunctionLikeDeclaration(structure, action);
}

/**
 * @generated
 */
function forMethodDeclaration<TStructure>(structure: MethodDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, action)
        || forFunctionLikeDeclaration(structure, action)
        || forAll(structure.overloads, action, StructureKind.MethodOverload);
}

/**
 * @generated
 */
function forMethodDeclarationOverload<TStructure>(structure: MethodDeclarationOverloadStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, action)
        || forTypeParameteredNode(structure, action)
        || forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forPropertyDeclaration<TStructure>(structure: PropertyDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action)
        || forDecoratableNode(structure, action);
}

/**
 * @generated
 */
function forSetAccessorDeclaration<TStructure>(structure: SetAccessorDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, action)
        || forFunctionLikeDeclaration(structure, action);
}

/**
 * @generated
 */
function forEnumDeclaration<TStructure>(structure: EnumDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action)
        || forAll(structure.members, action, StructureKind.EnumMember);
}

/**
 * @generated
 */
function forEnumMember<TStructure>(structure: EnumMemberStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forFunctionDeclaration<TStructure>(structure: FunctionDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forFunctionLikeDeclaration(structure, action)
        || forAll(structure.overloads, action, StructureKind.FunctionOverload);
}

/**
 * @generated
 */
function forFunctionDeclarationOverload<TStructure>(structure: FunctionDeclarationOverloadStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, action)
        || forTypeParameteredNode(structure, action)
        || forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forParameterDeclaration<TStructure>(structure: ParameterDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, action);
}

/**
 * @generated
 */
function forCallSignatureDeclaration<TStructure>(structure: CallSignatureDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action)
        || forSignaturedDeclaration(structure, action)
        || forTypeParameteredNode(structure, action);
}

/**
 * @generated
 */
function forConstructSignatureDeclaration<TStructure>(structure: ConstructSignatureDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action)
        || forSignaturedDeclaration(structure, action)
        || forTypeParameteredNode(structure, action);
}

/**
 * @generated
 */
function forIndexSignatureDeclaration<TStructure>(structure: IndexSignatureDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forInterfaceDeclaration<TStructure>(structure: InterfaceDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forTypeParameteredNode(structure, action)
        || forJSDocableNode(structure, action)
        || forTypeElementMemberedNode(structure, action);
}

/**
 * @generated
 */
function forTypeElementMemberedNode<TStructure>(structure: TypeElementMemberedNodeStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAll(structure.callSignatures, action, StructureKind.CallSignature)
        || forAll(structure.constructSignatures, action, StructureKind.ConstructSignature)
        || forAll(structure.indexSignatures, action, StructureKind.IndexSignature)
        || forAll(structure.methods, action, StructureKind.MethodSignature)
        || forAll(structure.properties, action, StructureKind.PropertySignature);
}

/**
 * @generated
 */
function forMethodSignature<TStructure>(structure: MethodSignatureStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action)
        || forSignaturedDeclaration(structure, action)
        || forTypeParameteredNode(structure, action);
}

/**
 * @generated
 */
function forPropertySignature<TStructure>(structure: PropertySignatureStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forJsxElement<TStructure>(structure: JsxElementStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllUnknownKindIfStructure(structure.attributes, action)
        || forAllUnknownKindIfStructure(structure.children, action);
}

/**
 * @generated
 */
function forJsxSelfClosingElement<TStructure>(structure: JsxSelfClosingElementStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJsxAttributedNode(structure, action);
}

/**
 * @generated
 */
function forJsxAttributedNode<TStructure>(structure: JsxAttributedNodeStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllUnknownKindIfStructure(structure.attributes, action);
}

/**
 * @generated
 */
function forExportDeclaration<TStructure>(structure: ExportDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.namedExports, action, StructureKind.ExportSpecifier);
}

/**
 * @generated
 */
function forImportDeclaration<TStructure>(structure: ImportDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.namedImports, action, StructureKind.ImportSpecifier);
}

/**
 * @generated
 */
function forNamespaceDeclaration<TStructure>(structure: NamespaceDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action)
        || forStatementedNode(structure, action);
}

/**
 * @generated
 */
function forSourceFile<TStructure>(structure: SourceFileStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forStatementedNode(structure, action);
}

/**
 * @generated
 */
function forVariableStatement<TStructure>(structure: VariableStatementStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, action)
        || forAll(structure.declarations, action, StructureKind.VariableDeclaration);
}

/**
 * @generated
 */
function forTypeAliasDeclaration<TStructure>(structure: TypeAliasDeclarationStructure, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forTypeParameteredNode(structure, action)
        || forJSDocableNode(structure, action);
}

function forAll<T extends OptionalKind<Structures>, TStructure>(
    structures: T[] | undefined,
    action: (structure: Structures) => TStructure | void,
    kind: Exclude<T["kind"], undefined>
): TStructure | undefined {
    if (structures == null)
        return;

    for (const structure of structures) {
        const result = action(ensureKind(structure, kind) as Structures); // typescript can't figure this out, but this is ok
        if (result)
            return result;
    }

    return undefined;
}

function forAllIfStructure<T extends OptionalKind<Structures>, TStructure>(
    values: (T | unknown)[] | unknown | undefined,
    action: (structure: Structures) => TStructure | void,
    kind: Exclude<T["kind"], undefined>
): TStructure | undefined {
    if (values == null || !(values instanceof Array))
        return;

    for (const value of values) {
        if (isStructure(value)) {
            const result = action(ensureKind(value, kind));
            if (result)
                return result;
        }
    }

    return undefined;
}

function forAllUnknownKindIfStructure<TStructure>(values: unknown, action: (structure: Structures) => TStructure | void): TStructure | undefined {
    if (values == null || !(values instanceof Array))
        return;

    for (const value of values) {
        if (isStructure(value)) {
            const result = action(value);
            if (result)
                return result;
        }
    }

    return undefined;
}

function ensureKind<T extends OptionalKind<Structures>>(structure: T, kind: Exclude<T["kind"], undefined>): T & { kind: Exclude<T["kind"], undefined>; } {
    if (structure.kind == null)
        structure.kind = kind;
    return structure as T & { kind: Exclude<T["kind"], undefined>; };
}

function isStructure(value: any): value is Structures {
    return value != null && typeof value.kind === "number";
}
