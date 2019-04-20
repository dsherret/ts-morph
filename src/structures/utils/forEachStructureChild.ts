import { StructureKind } from "../StructureKind";
import { Structures } from "../aliases";
import { DecoratableNodeStructure, SignaturedDeclarationStructure, ParameteredNodeStructure, TypeElementMemberedNodeStructure, TypeParameteredNodeStructure,
    JSDocableNodeStructure } from "../base";
import { ClassDeclarationStructure, GetAccessorDeclarationStructure, SetAccessorDeclarationStructure, ClassLikeDeclarationBaseStructure, ConstructorDeclarationOverloadStructure,
    MethodDeclarationStructure, MethodDeclarationOverloadStructure, PropertyDeclarationStructure, ConstructorDeclarationStructure } from "../class";
import { InterfaceDeclarationStructure, CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, MethodSignatureStructure,
    IndexSignatureDeclarationStructure, PropertySignatureStructure } from "../interface";
import { OptionalKind } from "../types";
import { EnumDeclarationStructure, EnumMemberStructure } from "../enum";
import { FunctionDeclarationStructure, FunctionLikeDeclarationStructure, FunctionDeclarationOverloadStructure, ParameterDeclarationStructure } from "../function";
import { JsxElementStructure, JsxSelfClosingElementStructure, JsxAttributedNodeStructure } from "../jsx";
import { VariableStatementStructure, StatementedNodeStructure } from "../statement";
import { ExportDeclarationStructure, ImportDeclarationStructure, NamespaceDeclarationStructure, SourceFileStructure, TypeAliasDeclarationStructure } from "..";

/**
 * @internal
 */
export function forEachStructureChild(structure: Structures, action: (child: Structures) => void): void;
/**
 * @internal
 */
export function forEachStructureChild(structure: Structures[], action: (child: Structures) => void): void;
export function forEachStructureChild(structure: Structures | Structures[], action: (child: Structures) => void) {
    // run `yarn run code-generate` to update the code in here
    if (structure instanceof Array) {
        for (const item of structure)
            forEachStructureChild(item, action);
        return;
    }

    switch (structure.kind) {
        case StructureKind.Class:
            forClassDeclaration(structure, action);
            break;
        case StructureKind.Constructor:
            forConstructorDeclaration(structure, action);
            break;
        case StructureKind.ConstructorOverload:
            forConstructorDeclarationOverload(structure, action);
            break;
        case StructureKind.GetAccessor:
            forGetAccessorDeclaration(structure, action);
            break;
        case StructureKind.Method:
            forMethodDeclaration(structure, action);
            break;
        case StructureKind.MethodOverload:
            forMethodDeclarationOverload(structure, action);
            break;
        case StructureKind.Property:
            forPropertyDeclaration(structure, action);
            break;
        case StructureKind.SetAccessor:
            forSetAccessorDeclaration(structure, action);
            break;
        case StructureKind.Enum:
            forEnumDeclaration(structure, action);
            break;
        case StructureKind.EnumMember:
            forEnumMember(structure, action);
            break;
        case StructureKind.Function:
            forFunctionDeclaration(structure, action);
            break;
        case StructureKind.FunctionOverload:
            forFunctionDeclarationOverload(structure, action);
            break;
        case StructureKind.Parameter:
            forParameterDeclaration(structure, action);
            break;
        case StructureKind.CallSignature:
            forCallSignatureDeclaration(structure, action);
            break;
        case StructureKind.ConstructSignature:
            forConstructSignatureDeclaration(structure, action);
            break;
        case StructureKind.IndexSignature:
            forIndexSignatureDeclaration(structure, action);
            break;
        case StructureKind.Interface:
            forInterfaceDeclaration(structure, action);
            break;
        case StructureKind.MethodSignature:
            forMethodSignature(structure, action);
            break;
        case StructureKind.PropertySignature:
            forPropertySignature(structure, action);
            break;
        case StructureKind.JsxElement:
            forJsxElement(structure, action);
            break;
        case StructureKind.JsxSelfClosingElement:
            forJsxSelfClosingElement(structure, action);
            break;
        case StructureKind.ExportDeclaration:
            forExportDeclaration(structure, action);
            break;
        case StructureKind.ImportDeclaration:
            forImportDeclaration(structure, action);
            break;
        case StructureKind.Namespace:
            forNamespaceDeclaration(structure, action);
            break;
        case StructureKind.SourceFile:
            forSourceFile(structure, action);
            break;
        case StructureKind.VariableStatement:
            forVariableStatement(structure, action);
            break;
        case StructureKind.TypeAlias:
            forTypeAliasDeclaration(structure, action);
            break;
    }
}

/**
 * @generated
 */
function forClassDeclaration(structure: ClassDeclarationStructure, action: (structure: Structures) => void) {
    forClassLikeDeclarationBase(structure, action);
}

/**
 * @generated
 */
function forClassLikeDeclarationBase(structure: ClassLikeDeclarationBaseStructure, action: (structure: Structures) => void) {
    forDecoratableNode(structure, action);
    forTypeParameteredNode(structure, action);
    forJSDocableNode(structure, action);

    forAll(structure.ctors, action, StructureKind.Constructor);
    forAll(structure.properties, action, StructureKind.Property);
    forAll(structure.getAccessors, action, StructureKind.GetAccessor);
    forAll(structure.setAccessors, action, StructureKind.SetAccessor);
    forAll(structure.methods, action, StructureKind.Method);
}

/**
 * @generated
 */
function forDecoratableNode(structure: DecoratableNodeStructure, action: (structure: Structures) => void) {
    forAll(structure.decorators, action, StructureKind.Decorator);
}

/**
 * @generated
 */
function forTypeParameteredNode(structure: TypeParameteredNodeStructure, action: (structure: Structures) => void) {
    forAllIfStructure(structure.typeParameters, action, StructureKind.TypeParameter);
}

/**
 * @generated
 */
function forJSDocableNode(structure: JSDocableNodeStructure, action: (structure: Structures) => void) {
    forAllIfStructure(structure.docs, action, StructureKind.JSDoc);
}

/**
 * @generated
 */
function forConstructorDeclaration(structure: ConstructorDeclarationStructure, action: (structure: Structures) => void) {
    forFunctionLikeDeclaration(structure, action);

    forAll(structure.overloads, action, StructureKind.ConstructorOverload);
}

/**
 * @generated
 */
function forFunctionLikeDeclaration(structure: FunctionLikeDeclarationStructure, action: (structure: Structures) => void) {
    forSignaturedDeclaration(structure, action);
    forTypeParameteredNode(structure, action);
    forJSDocableNode(structure, action);
    forStatementedNode(structure, action);
}

/**
 * @generated
 */
function forSignaturedDeclaration(structure: SignaturedDeclarationStructure, action: (structure: Structures) => void) {
    forParameteredNode(structure, action);
}

/**
 * @generated
 */
function forParameteredNode(structure: ParameteredNodeStructure, action: (structure: Structures) => void) {
    forAll(structure.parameters, action, StructureKind.Parameter);
}

/**
 * @generated
 */
function forStatementedNode(structure: StatementedNodeStructure, action: (structure: Structures) => void) {
    forAllUnknownKindIfStructure(structure.statements, action);
}

/**
 * @generated
 */
function forConstructorDeclarationOverload(structure: ConstructorDeclarationOverloadStructure, action: (structure: Structures) => void) {
    forSignaturedDeclaration(structure, action);
    forTypeParameteredNode(structure, action);
    forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forGetAccessorDeclaration(structure: GetAccessorDeclarationStructure, action: (structure: Structures) => void) {
    forDecoratableNode(structure, action);
    forFunctionLikeDeclaration(structure, action);
}

/**
 * @generated
 */
function forMethodDeclaration(structure: MethodDeclarationStructure, action: (structure: Structures) => void) {
    forDecoratableNode(structure, action);
    forFunctionLikeDeclaration(structure, action);

    forAll(structure.overloads, action, StructureKind.MethodOverload);
}

/**
 * @generated
 */
function forMethodDeclarationOverload(structure: MethodDeclarationOverloadStructure, action: (structure: Structures) => void) {
    forSignaturedDeclaration(structure, action);
    forTypeParameteredNode(structure, action);
    forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forPropertyDeclaration(structure: PropertyDeclarationStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
    forDecoratableNode(structure, action);
}

/**
 * @generated
 */
function forSetAccessorDeclaration(structure: SetAccessorDeclarationStructure, action: (structure: Structures) => void) {
    forDecoratableNode(structure, action);
    forFunctionLikeDeclaration(structure, action);
}

/**
 * @generated
 */
function forEnumDeclaration(structure: EnumDeclarationStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);

    forAll(structure.members, action, StructureKind.EnumMember);
}

/**
 * @generated
 */
function forEnumMember(structure: EnumMemberStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forFunctionDeclaration(structure: FunctionDeclarationStructure, action: (structure: Structures) => void) {
    forFunctionLikeDeclaration(structure, action);

    forAll(structure.overloads, action, StructureKind.FunctionOverload);
}

/**
 * @generated
 */
function forFunctionDeclarationOverload(structure: FunctionDeclarationOverloadStructure, action: (structure: Structures) => void) {
    forSignaturedDeclaration(structure, action);
    forTypeParameteredNode(structure, action);
    forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forParameterDeclaration(structure: ParameterDeclarationStructure, action: (structure: Structures) => void) {
    forDecoratableNode(structure, action);
}

/**
 * @generated
 */
function forCallSignatureDeclaration(structure: CallSignatureDeclarationStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
    forSignaturedDeclaration(structure, action);
    forTypeParameteredNode(structure, action);
}

/**
 * @generated
 */
function forConstructSignatureDeclaration(structure: ConstructSignatureDeclarationStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
    forSignaturedDeclaration(structure, action);
    forTypeParameteredNode(structure, action);
}

/**
 * @generated
 */
function forIndexSignatureDeclaration(structure: IndexSignatureDeclarationStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forInterfaceDeclaration(structure: InterfaceDeclarationStructure, action: (structure: Structures) => void) {
    forTypeParameteredNode(structure, action);
    forJSDocableNode(structure, action);
    forTypeElementMemberedNode(structure, action);
}

/**
 * @generated
 */
function forTypeElementMemberedNode(structure: TypeElementMemberedNodeStructure, action: (structure: Structures) => void) {
    forAll(structure.callSignatures, action, StructureKind.CallSignature);
    forAll(structure.constructSignatures, action, StructureKind.ConstructSignature);
    forAll(structure.indexSignatures, action, StructureKind.IndexSignature);
    forAll(structure.methods, action, StructureKind.MethodSignature);
    forAll(structure.properties, action, StructureKind.PropertySignature);
}

/**
 * @generated
 */
function forMethodSignature(structure: MethodSignatureStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
    forSignaturedDeclaration(structure, action);
    forTypeParameteredNode(structure, action);
}

/**
 * @generated
 */
function forPropertySignature(structure: PropertySignatureStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
}

/**
 * @generated
 */
function forJsxElement(structure: JsxElementStructure, action: (structure: Structures) => void) {
    forAllUnknownKindIfStructure(structure.attributes, action);
    forAllUnknownKindIfStructure(structure.children, action);
}

/**
 * @generated
 */
function forJsxSelfClosingElement(structure: JsxSelfClosingElementStructure, action: (structure: Structures) => void) {
    forJsxAttributedNode(structure, action);
}

/**
 * @generated
 */
function forJsxAttributedNode(structure: JsxAttributedNodeStructure, action: (structure: Structures) => void) {
    forAllUnknownKindIfStructure(structure.attributes, action);
}

/**
 * @generated
 */
function forExportDeclaration(structure: ExportDeclarationStructure, action: (structure: Structures) => void) {
    forAllIfStructure(structure.namedExports, action, StructureKind.ExportSpecifier);
}

/**
 * @generated
 */
function forImportDeclaration(structure: ImportDeclarationStructure, action: (structure: Structures) => void) {
    forAllIfStructure(structure.namedImports, action, StructureKind.ImportSpecifier);
}

/**
 * @generated
 */
function forNamespaceDeclaration(structure: NamespaceDeclarationStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);
    forStatementedNode(structure, action);
}

/**
 * @generated
 */
function forSourceFile(structure: SourceFileStructure, action: (structure: Structures) => void) {
    forStatementedNode(structure, action);
}

/**
 * @generated
 */
function forVariableStatement(structure: VariableStatementStructure, action: (structure: Structures) => void) {
    forJSDocableNode(structure, action);

    forAll(structure.declarations, action, StructureKind.VariableDeclaration);
}

/**
 * @generated
 */
function forTypeAliasDeclaration(structure: TypeAliasDeclarationStructure, action: (structure: Structures) => void) {
    forTypeParameteredNode(structure, action);
    forJSDocableNode(structure, action);
}

function forAll<T extends OptionalKind<Structures>>(structures: T[] | undefined, action: (structure: Structures) => void, kind: Exclude<T["kind"], undefined>) {
    if (structures == null)
        return;

    for (const structure of structures)
        action(ensureKind(structure, kind) as Structures); // typescript can't figure this out, but this is ok
}

function forAllIfStructure<T extends OptionalKind<Structures>>(
    values: (T | unknown)[] | unknown | undefined, action: (structure: Structures) => void,
    kind: Exclude<T["kind"], undefined>
) {
    if (values == null || !(values instanceof Array))
        return;

    for (const value of values) {
        if (isStructure(value))
            action(ensureKind(value, kind));
    }
}

function forAllUnknownKindIfStructure(values: unknown, action: (structure: Structures) => void) {
    if (values == null || !(values instanceof Array))
        return;

    for (const value of values) {
        if (isStructure(value))
            action(value);
    }
}

function ensureKind<T extends OptionalKind<Structures>>(structure: T, kind: Exclude<T["kind"], undefined>): T & { kind: Exclude<T["kind"], undefined>; } {
    if (structure.kind == null)
        structure.kind = kind;
    return structure as T & { kind: Exclude<T["kind"], undefined>; };
}

function isStructure(value: any): value is Structures {
    return value != null && typeof value.kind === "number";
}
