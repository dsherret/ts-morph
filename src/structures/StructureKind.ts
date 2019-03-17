import { AssertTrue, IsExact } from "conditional-type-checks";
import { SyntaxKind } from "../typescript";

export enum StructureKind {
    Class,
    Constructor,
    GetAccessor,
    SetAccessor,
    Property,
    Enum,
    Function,
    CallSignature,
    ConstructSignature,
    IndexSignature,
    Interface,
    Method,
    MethodSignature,
    PropertySignature,
    ExportAssignment,
    ExportDeclaration,
    ImportDeclaration,
    Namespace,
    VariableStatement,
    TypeAlias,
    PropertyAssignment,
    ShorthandPropertyAssignment,
    SpreadAssignment,
    JsxAttribute,
    JsxSpreadAttribute,
    JsxElement,
    JsxSelfClosingElement
}

// todo: remove StructureKindToSyntaxKind?

/**
 * Type that maps a structure kind to syntax kinds.
 * @internal
 */
export interface StructureKindToSyntaxKind {
    [StructureKind.Class]: SyntaxKind.ClassDeclaration;
    [StructureKind.Constructor]: SyntaxKind.Constructor;
    [StructureKind.GetAccessor]: SyntaxKind.GetAccessor;
    [StructureKind.SetAccessor]: SyntaxKind.SetAccessor;
    [StructureKind.Property]: SyntaxKind.PropertyDeclaration;
    [StructureKind.Enum]: SyntaxKind.EnumDeclaration;
    [StructureKind.Function]: SyntaxKind.FunctionDeclaration;
    [StructureKind.CallSignature]: SyntaxKind.CallSignature;
    [StructureKind.ConstructSignature]: SyntaxKind.ConstructSignature;
    [StructureKind.IndexSignature]: SyntaxKind.IndexSignature;
    [StructureKind.Interface]: SyntaxKind.InterfaceDeclaration;
    [StructureKind.Method]: SyntaxKind.MethodDeclaration;
    [StructureKind.MethodSignature]: SyntaxKind.MethodSignature;
    [StructureKind.PropertySignature]: SyntaxKind.PropertySignature;
    [StructureKind.ExportAssignment]: SyntaxKind.ExportAssignment;
    [StructureKind.ExportDeclaration]: SyntaxKind.ExportDeclaration;
    [StructureKind.ImportDeclaration]: SyntaxKind.ImportDeclaration;
    [StructureKind.Namespace]: SyntaxKind.ModuleDeclaration;
    [StructureKind.VariableStatement]: SyntaxKind.VariableStatement;
    [StructureKind.TypeAlias]: SyntaxKind.TypeAliasDeclaration;
    [StructureKind.PropertyAssignment]: SyntaxKind.PropertyAssignment;
    [StructureKind.ShorthandPropertyAssignment]: SyntaxKind.ShorthandPropertyAssignment;
    [StructureKind.SpreadAssignment]: SyntaxKind.SpreadAssignment;
    [StructureKind.JsxAttribute]: SyntaxKind.JsxAttribute;
    [StructureKind.JsxSpreadAttribute]: SyntaxKind.JsxSpreadAttribute;
    [StructureKind.JsxElement]: SyntaxKind.JsxElement;
    [StructureKind.JsxSelfClosingElement]: SyntaxKind.JsxSelfClosingElement;
}

type _assertKeysMatch = AssertTrue<IsExact<keyof StructureKindToSyntaxKind, StructureKind>>;
