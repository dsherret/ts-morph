// dprint-ignore-file
import { ArrayUtils } from "@ts-morph/common";
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

/**
 * Iterates over the elements in the provided array.
 * @param structures - Array of structures to iterate over.
 * @param callback - Callback to do on each element in the array. Returning a truthy value will return that value in the main function call.
 */
export function forEachStructureChild<TStructure>(structures: ReadonlyArray<Structures>, callback: (child: Structures) => TStructure | void): TStructure | undefined;
/**
 * Iterates over the children of the provided array.
 * @remarks If the children do not have a `kind` property, it will be automatically added.
 * @param structure - Structure to iterate over.
 * @param callback - Callback to do on each child of the provided structure. Returning a truthy value will return that value in the main function call.
 */
export function forEachStructureChild<TStructure>(structure: Structures, callback: (child: Structures) => TStructure | void): TStructure | undefined;
export function forEachStructureChild<TStructure>(structure: Structures | ReadonlyArray<Structures>, callback: (child: Structures) => TStructure | void): TStructure | undefined {
    // automatically generated: run `yarn run code-generate` to update the code in here
    if (ArrayUtils.isReadonlyArray(structure)) {
        for (const item of structure) {
            const result = callback(item);
            if (result)
                return result;
        }
        return undefined;
    }

    switch (structure.kind) {
        case StructureKind.Class:
            return forClassDeclaration(structure, callback);
        case StructureKind.Constructor:
            return forConstructorDeclaration(structure, callback);
        case StructureKind.ConstructorOverload:
            return forConstructorDeclarationOverload(structure, callback);
        case StructureKind.GetAccessor:
            return forGetAccessorDeclaration(structure, callback);
        case StructureKind.Method:
            return forMethodDeclaration(structure, callback);
        case StructureKind.MethodOverload:
            return forMethodDeclarationOverload(structure, callback);
        case StructureKind.Property:
            return forPropertyDeclaration(structure, callback);
        case StructureKind.SetAccessor:
            return forSetAccessorDeclaration(structure, callback);
        case StructureKind.Enum:
            return forEnumDeclaration(structure, callback);
        case StructureKind.EnumMember:
            return forEnumMember(structure, callback);
        case StructureKind.Function:
            return forFunctionDeclaration(structure, callback);
        case StructureKind.FunctionOverload:
            return forFunctionDeclarationOverload(structure, callback);
        case StructureKind.Parameter:
            return forParameterDeclaration(structure, callback);
        case StructureKind.CallSignature:
            return forCallSignatureDeclaration(structure, callback);
        case StructureKind.ConstructSignature:
            return forConstructSignatureDeclaration(structure, callback);
        case StructureKind.IndexSignature:
            return forIndexSignatureDeclaration(structure, callback);
        case StructureKind.Interface:
            return forInterfaceDeclaration(structure, callback);
        case StructureKind.MethodSignature:
            return forMethodSignature(structure, callback);
        case StructureKind.PropertySignature:
            return forPropertySignature(structure, callback);
        case StructureKind.JsxElement:
            return forJsxElement(structure, callback);
        case StructureKind.JsxSelfClosingElement:
            return forJsxSelfClosingElement(structure, callback);
        case StructureKind.ExportDeclaration:
            return forExportDeclaration(structure, callback);
        case StructureKind.ImportDeclaration:
            return forImportDeclaration(structure, callback);
        case StructureKind.Namespace:
            return forNamespaceDeclaration(structure, callback);
        case StructureKind.SourceFile:
            return forSourceFile(structure, callback);
        case StructureKind.VariableStatement:
            return forVariableStatement(structure, callback);
        case StructureKind.TypeAlias:
            return forTypeAliasDeclaration(structure, callback);
        default:
            return undefined;
    }
}

/**
 * @generated
 */
function forClassDeclaration<TStructure>(structure: ClassDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forClassLikeDeclarationBase(structure, callback);
}

/**
 * @generated
 */
function forClassLikeDeclarationBase<TStructure>(structure: ClassLikeDeclarationBaseStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, callback)
        || forTypeParameteredNode(structure, callback)
        || forJSDocableNode(structure, callback)
        || forAll(structure.ctors, callback, StructureKind.Constructor)
        || forAll(structure.properties, callback, StructureKind.Property)
        || forAll(structure.getAccessors, callback, StructureKind.GetAccessor)
        || forAll(structure.setAccessors, callback, StructureKind.SetAccessor)
        || forAll(structure.methods, callback, StructureKind.Method);
}

/**
 * @generated
 */
function forDecoratableNode<TStructure>(structure: DecoratableNodeStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAll(structure.decorators, callback, StructureKind.Decorator);
}

/**
 * @generated
 */
function forTypeParameteredNode<TStructure>(structure: TypeParameteredNodeStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.typeParameters, callback, StructureKind.TypeParameter);
}

/**
 * @generated
 */
function forJSDocableNode<TStructure>(structure: JSDocableNodeStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.docs, callback, StructureKind.JSDoc);
}

/**
 * @generated
 */
function forConstructorDeclaration<TStructure>(structure: ConstructorDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forFunctionLikeDeclaration(structure, callback)
        || forAll(structure.overloads, callback, StructureKind.ConstructorOverload);
}

/**
 * @generated
 */
function forFunctionLikeDeclaration<TStructure>(structure: FunctionLikeDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, callback)
        || forTypeParameteredNode(structure, callback)
        || forJSDocableNode(structure, callback)
        || forStatementedNode(structure, callback);
}

/**
 * @generated
 */
function forSignaturedDeclaration<TStructure>(structure: SignaturedDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forParameteredNode(structure, callback);
}

/**
 * @generated
 */
function forParameteredNode<TStructure>(structure: ParameteredNodeStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAll(structure.parameters, callback, StructureKind.Parameter);
}

/**
 * @generated
 */
function forStatementedNode<TStructure>(structure: StatementedNodeStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllUnknownKindIfStructure(structure.statements, callback);
}

/**
 * @generated
 */
function forConstructorDeclarationOverload<TStructure>(structure: ConstructorDeclarationOverloadStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, callback)
        || forTypeParameteredNode(structure, callback)
        || forJSDocableNode(structure, callback);
}

/**
 * @generated
 */
function forGetAccessorDeclaration<TStructure>(structure: GetAccessorDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, callback)
        || forFunctionLikeDeclaration(structure, callback);
}

/**
 * @generated
 */
function forMethodDeclaration<TStructure>(structure: MethodDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, callback)
        || forFunctionLikeDeclaration(structure, callback)
        || forAll(structure.overloads, callback, StructureKind.MethodOverload);
}

/**
 * @generated
 */
function forMethodDeclarationOverload<TStructure>(structure: MethodDeclarationOverloadStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, callback)
        || forTypeParameteredNode(structure, callback)
        || forJSDocableNode(structure, callback);
}

/**
 * @generated
 */
function forPropertyDeclaration<TStructure>(structure: PropertyDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback)
        || forDecoratableNode(structure, callback);
}

/**
 * @generated
 */
function forSetAccessorDeclaration<TStructure>(structure: SetAccessorDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, callback)
        || forFunctionLikeDeclaration(structure, callback);
}

/**
 * @generated
 */
function forEnumDeclaration<TStructure>(structure: EnumDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback)
        || forAll(structure.members, callback, StructureKind.EnumMember);
}

/**
 * @generated
 */
function forEnumMember<TStructure>(structure: EnumMemberStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback);
}

/**
 * @generated
 */
function forFunctionDeclaration<TStructure>(structure: FunctionDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forFunctionLikeDeclaration(structure, callback)
        || forAll(structure.overloads, callback, StructureKind.FunctionOverload);
}

/**
 * @generated
 */
function forFunctionDeclarationOverload<TStructure>(structure: FunctionDeclarationOverloadStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forSignaturedDeclaration(structure, callback)
        || forTypeParameteredNode(structure, callback)
        || forJSDocableNode(structure, callback);
}

/**
 * @generated
 */
function forParameterDeclaration<TStructure>(structure: ParameterDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forDecoratableNode(structure, callback);
}

/**
 * @generated
 */
function forCallSignatureDeclaration<TStructure>(structure: CallSignatureDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback)
        || forSignaturedDeclaration(structure, callback)
        || forTypeParameteredNode(structure, callback);
}

/**
 * @generated
 */
function forConstructSignatureDeclaration<TStructure>(structure: ConstructSignatureDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback)
        || forSignaturedDeclaration(structure, callback)
        || forTypeParameteredNode(structure, callback);
}

/**
 * @generated
 */
function forIndexSignatureDeclaration<TStructure>(structure: IndexSignatureDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback);
}

/**
 * @generated
 */
function forInterfaceDeclaration<TStructure>(structure: InterfaceDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forTypeParameteredNode(structure, callback)
        || forJSDocableNode(structure, callback)
        || forTypeElementMemberedNode(structure, callback);
}

/**
 * @generated
 */
function forTypeElementMemberedNode<TStructure>(structure: TypeElementMemberedNodeStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAll(structure.callSignatures, callback, StructureKind.CallSignature)
        || forAll(structure.constructSignatures, callback, StructureKind.ConstructSignature)
        || forAll(structure.indexSignatures, callback, StructureKind.IndexSignature)
        || forAll(structure.methods, callback, StructureKind.MethodSignature)
        || forAll(structure.properties, callback, StructureKind.PropertySignature);
}

/**
 * @generated
 */
function forMethodSignature<TStructure>(structure: MethodSignatureStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback)
        || forSignaturedDeclaration(structure, callback)
        || forTypeParameteredNode(structure, callback);
}

/**
 * @generated
 */
function forPropertySignature<TStructure>(structure: PropertySignatureStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback);
}

/**
 * @generated
 */
function forJsxElement<TStructure>(structure: JsxElementStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllUnknownKindIfStructure(structure.attributes, callback)
        || forAllUnknownKindIfStructure(structure.children, callback);
}

/**
 * @generated
 */
function forJsxSelfClosingElement<TStructure>(structure: JsxSelfClosingElementStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJsxAttributedNode(structure, callback);
}

/**
 * @generated
 */
function forJsxAttributedNode<TStructure>(structure: JsxAttributedNodeStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllUnknownKindIfStructure(structure.attributes, callback);
}

/**
 * @generated
 */
function forExportDeclaration<TStructure>(structure: ExportDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.namedExports, callback, StructureKind.ExportSpecifier);
}

/**
 * @generated
 */
function forImportDeclaration<TStructure>(structure: ImportDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forAllIfStructure(structure.namedImports, callback, StructureKind.ImportSpecifier);
}

/**
 * @generated
 */
function forNamespaceDeclaration<TStructure>(structure: NamespaceDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback)
        || forStatementedNode(structure, callback);
}

/**
 * @generated
 */
function forSourceFile<TStructure>(structure: SourceFileStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forStatementedNode(structure, callback);
}

/**
 * @generated
 */
function forVariableStatement<TStructure>(structure: VariableStatementStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forJSDocableNode(structure, callback)
        || forAll(structure.declarations, callback, StructureKind.VariableDeclaration);
}

/**
 * @generated
 */
function forTypeAliasDeclaration<TStructure>(structure: TypeAliasDeclarationStructure, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    return forTypeParameteredNode(structure, callback)
        || forJSDocableNode(structure, callback);
}

function forAll<T extends OptionalKind<Structures>, TStructure>(
    structures: T[] | undefined,
    callback: (structure: Structures) => TStructure | void,
    kind: Exclude<T["kind"], undefined>
): TStructure | undefined {
    if (structures == null)
        return;

    for (const structure of structures) {
        const result = callback(ensureKind(structure, kind) as Structures); // typescript can't figure this out, but this is ok
        if (result)
            return result;
    }

    return undefined;
}

function forAllIfStructure<T extends OptionalKind<Structures>, TStructure>(
    values: (T | unknown)[] | unknown | undefined,
    callback: (structure: Structures) => TStructure | void,
    kind: Exclude<T["kind"], undefined>
): TStructure | undefined {
    if (values == null || !(values instanceof Array))
        return;

    for (const value of values) {
        if (isStructure(value)) {
            const result = callback(ensureKind(value, kind));
            if (result)
                return result;
        }
    }

    return undefined;
}

function forAllUnknownKindIfStructure<TStructure>(values: unknown, callback: (structure: Structures) => TStructure | void): TStructure | undefined {
    if (values == null || !(values instanceof Array))
        return;

    for (const value of values) {
        if (isStructure(value)) {
            const result = callback(value);
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
