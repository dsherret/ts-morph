import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { NameableNodeStructure, AsyncableNodeStructure, ImplementsClauseableNodeStructure, JSDocableNodeStructure, AbstractableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, ParameteredNodeStructure, ReturnTypedNodeStructure,
    PropertyNamedNodeStructure, StaticableNodeStructure, TypeParameteredNodeStructure, GeneratorableNodeStructure, QuestionTokenableNodeStructure,
    TypedNodeStructure, ExclamationTokenableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, NamedNodeStructure,
    BindingNamedNodeStructure, ScopeableNodeStructure, ExtendsClauseableNodeStructure, TypeElementMemberedNodeStructure,
    DecoratableNodeStructure } from "../base";
import { ClassDeclarationStructure, ClassLikeDeclarationBaseStructure, ConstructorDeclarationStructure, ConstructorDeclarationOverloadStructure,
    GetAccessorDeclarationStructure, MethodDeclarationStructure, MethodDeclarationOverloadStructure, PropertyDeclarationStructure,
    SetAccessorDeclarationStructure } from "../class";
import { DecoratorStructure } from "../decorator";
import { JSDocStructure } from "../doc";
import { EnumDeclarationStructure, EnumMemberStructure } from "../enum";
import { PropertyAssignmentStructure, SpreadAssignmentStructure, ExpressionedNodeStructure, ShorthandPropertyAssignmentStructure } from "../expression";
import { FunctionLikeDeclarationStructure, FunctionDeclarationStructure, FunctionDeclarationOverloadStructure,
    ParameterDeclarationStructure } from "../function";
import { InterfaceDeclarationStructure, CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure,
    MethodSignatureStructure, PropertySignatureStructure } from "../interface";
import { JsxAttributeStructure, JsxElementStructure, JsxSelfClosingElementStructure, JsxTagNamedNodeStructure, JsxAttributedNodeStructure,
    JsxSpreadAttributeStructure } from "../jsx";
import { ExportAssignmentStructure, ExportDeclarationStructure, ExportSpecifierStructure, ImportDeclarationStructure, ImportSpecifierStructure,
    NamespaceDeclarationStructure, SourceFileStructure } from "../module";
import { VariableDeclarationStructure, StatementedNodeStructure, VariableStatementStructure } from "../statement";
import { TypeAliasDeclarationStructure, TypeParameterDeclarationStructure } from "../type";

/** Type guards for use on structures. */
export class StructureTypeGuards {
    private constructor() {
    }

    /**
     * Gets if the provided structure has a name.
     */
    static hasName<T extends Structure>(structure: T): structure is T & { name: string; } {
        return typeof (structure as any).name === "string";
    }

    /**
     * Gets if the provided structure is a ClassDeclarationStructure.
     */
    static isClass(structure: Structure & { kind: StructureKind; }): structure is ClassDeclarationStructure {
        return structure.kind === StructureKind.Class;
    }

    /**
     * Gets if the provided structure is a ClassLikeDeclarationBaseStructure.
     */
    static isClassLikeDeclarationBase<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ClassLikeDeclarationBaseStructure {
        return structure.kind === StructureKind.Class;
    }

    /**
     * Gets if the provided structure is a NameableNodeStructure.
     */
    static isNameable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & NameableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Class:
            case StructureKind.Function:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ImplementsClauseableNodeStructure.
     */
    static isImplementsClauseable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ImplementsClauseableNodeStructure {
        return structure.kind === StructureKind.Class;
    }

    /**
     * Gets if the provided structure is a DecoratableNodeStructure.
     */
    static isDecoratable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & DecoratableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Class:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.Property:
            case StructureKind.SetAccessor:
            case StructureKind.Parameter:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a TypeParameteredNodeStructure.
     */
    static isTypeParametered<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & TypeParameteredNodeStructure {
        switch (structure.kind) {
            case StructureKind.Class:
            case StructureKind.Constructor:
            case StructureKind.ConstructorOverload:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.SetAccessor:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
            case StructureKind.CallSignature:
            case StructureKind.ConstructSignature:
            case StructureKind.Interface:
            case StructureKind.MethodSignature:
            case StructureKind.TypeAlias:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a JSDocableNodeStructure.
     */
    static isJSDocable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & JSDocableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Class:
            case StructureKind.Constructor:
            case StructureKind.ConstructorOverload:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.Property:
            case StructureKind.SetAccessor:
            case StructureKind.Enum:
            case StructureKind.EnumMember:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
            case StructureKind.CallSignature:
            case StructureKind.ConstructSignature:
            case StructureKind.IndexSignature:
            case StructureKind.Interface:
            case StructureKind.MethodSignature:
            case StructureKind.PropertySignature:
            case StructureKind.Namespace:
            case StructureKind.VariableStatement:
            case StructureKind.TypeAlias:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a AbstractableNodeStructure.
     */
    static isAbstractable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & AbstractableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Class:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.Property:
            case StructureKind.SetAccessor:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a AmbientableNodeStructure.
     */
    static isAmbientable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & AmbientableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Class:
            case StructureKind.Enum:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
            case StructureKind.Interface:
            case StructureKind.Namespace:
            case StructureKind.VariableStatement:
            case StructureKind.TypeAlias:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ExportableNodeStructure.
     */
    static isExportable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ExportableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Class:
            case StructureKind.Enum:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
            case StructureKind.Interface:
            case StructureKind.Namespace:
            case StructureKind.VariableStatement:
            case StructureKind.TypeAlias:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ConstructorDeclarationStructure.
     */
    static isConstructor(structure: Structure & { kind: StructureKind; }): structure is ConstructorDeclarationStructure {
        return structure.kind === StructureKind.Constructor;
    }

    /**
     * Gets if the provided structure is a ScopedNodeStructure.
     */
    static isScoped<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ScopedNodeStructure {
        switch (structure.kind) {
            case StructureKind.Constructor:
            case StructureKind.ConstructorOverload:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.Property:
            case StructureKind.SetAccessor:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a FunctionLikeDeclarationStructure.
     */
    static isFunctionLike<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & FunctionLikeDeclarationStructure {
        switch (structure.kind) {
            case StructureKind.Constructor:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.SetAccessor:
            case StructureKind.Function:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a SignaturedDeclarationStructure.
     */
    static isSignatured<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & SignaturedDeclarationStructure {
        switch (structure.kind) {
            case StructureKind.Constructor:
            case StructureKind.ConstructorOverload:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.SetAccessor:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
            case StructureKind.CallSignature:
            case StructureKind.ConstructSignature:
            case StructureKind.MethodSignature:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ParameteredNodeStructure.
     */
    static isParametered<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ParameteredNodeStructure {
        switch (structure.kind) {
            case StructureKind.Constructor:
            case StructureKind.ConstructorOverload:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.SetAccessor:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
            case StructureKind.CallSignature:
            case StructureKind.ConstructSignature:
            case StructureKind.MethodSignature:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ReturnTypedNodeStructure.
     */
    static isReturnTyped<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ReturnTypedNodeStructure {
        switch (structure.kind) {
            case StructureKind.Constructor:
            case StructureKind.ConstructorOverload:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.SetAccessor:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
            case StructureKind.CallSignature:
            case StructureKind.ConstructSignature:
            case StructureKind.IndexSignature:
            case StructureKind.MethodSignature:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a StatementedNodeStructure.
     */
    static isStatemented<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & StatementedNodeStructure {
        switch (structure.kind) {
            case StructureKind.Constructor:
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.SetAccessor:
            case StructureKind.Function:
            case StructureKind.Namespace:
            case StructureKind.SourceFile:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ConstructorDeclarationOverloadStructure.
     */
    static isConstructorDeclarationOverload(structure: Structure & { kind: StructureKind; }): structure is ConstructorDeclarationOverloadStructure {
        return structure.kind === StructureKind.ConstructorOverload;
    }

    /**
     * Gets if the provided structure is a GetAccessorDeclarationStructure.
     */
    static isGetAccessor(structure: Structure & { kind: StructureKind; }): structure is GetAccessorDeclarationStructure {
        return structure.kind === StructureKind.GetAccessor;
    }

    /**
     * Gets if the provided structure is a PropertyNamedNodeStructure.
     */
    static isPropertyNamed<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & PropertyNamedNodeStructure {
        switch (structure.kind) {
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.Property:
            case StructureKind.SetAccessor:
            case StructureKind.EnumMember:
            case StructureKind.MethodSignature:
            case StructureKind.PropertySignature:
            case StructureKind.PropertyAssignment:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a StaticableNodeStructure.
     */
    static isStaticable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & StaticableNodeStructure {
        switch (structure.kind) {
            case StructureKind.GetAccessor:
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.Property:
            case StructureKind.SetAccessor:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a MethodDeclarationStructure.
     */
    static isMethod(structure: Structure & { kind: StructureKind; }): structure is MethodDeclarationStructure {
        return structure.kind === StructureKind.Method;
    }

    /**
     * Gets if the provided structure is a AsyncableNodeStructure.
     */
    static isAsyncable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & AsyncableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a GeneratorableNodeStructure.
     */
    static isGeneratorable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & GeneratorableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.Function:
            case StructureKind.FunctionOverload:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a QuestionTokenableNodeStructure.
     */
    static isQuestionTokenable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & QuestionTokenableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Method:
            case StructureKind.MethodOverload:
            case StructureKind.Property:
            case StructureKind.Parameter:
            case StructureKind.MethodSignature:
            case StructureKind.PropertySignature:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a MethodDeclarationOverloadStructure.
     */
    static isMethodDeclarationOverload(structure: Structure & { kind: StructureKind; }): structure is MethodDeclarationOverloadStructure {
        return structure.kind === StructureKind.MethodOverload;
    }

    /**
     * Gets if the provided structure is a PropertyDeclarationStructure.
     */
    static isProperty(structure: Structure & { kind: StructureKind; }): structure is PropertyDeclarationStructure {
        return structure.kind === StructureKind.Property;
    }

    /**
     * Gets if the provided structure is a TypedNodeStructure.
     */
    static isTyped<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & TypedNodeStructure {
        switch (structure.kind) {
            case StructureKind.Property:
            case StructureKind.Parameter:
            case StructureKind.PropertySignature:
            case StructureKind.VariableDeclaration:
            case StructureKind.TypeAlias:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ExclamationTokenableNodeStructure.
     */
    static isExclamationTokenable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ExclamationTokenableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Property:
            case StructureKind.VariableDeclaration:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ReadonlyableNodeStructure.
     */
    static isReadonlyable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ReadonlyableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Property:
            case StructureKind.Parameter:
            case StructureKind.IndexSignature:
            case StructureKind.PropertySignature:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a InitializerExpressionableNodeStructure.
     */
    static isInitializerExpressionable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & InitializerExpressionableNodeStructure {
        switch (structure.kind) {
            case StructureKind.Property:
            case StructureKind.EnumMember:
            case StructureKind.Parameter:
            case StructureKind.PropertySignature:
            case StructureKind.VariableDeclaration:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a SetAccessorDeclarationStructure.
     */
    static isSetAccessor(structure: Structure & { kind: StructureKind; }): structure is SetAccessorDeclarationStructure {
        return structure.kind === StructureKind.SetAccessor;
    }

    /**
     * Gets if the provided structure is a DecoratorStructure.
     */
    static isDecorator(structure: Structure & { kind: StructureKind; }): structure is DecoratorStructure {
        return structure.kind === StructureKind.Decorator;
    }

    /**
     * Gets if the provided structure is a JSDocStructure.
     */
    static isJSDoc(structure: Structure & { kind: StructureKind; }): structure is JSDocStructure {
        return structure.kind === StructureKind.JSDoc;
    }

    /**
     * Gets if the provided structure is a EnumDeclarationStructure.
     */
    static isEnum(structure: Structure & { kind: StructureKind; }): structure is EnumDeclarationStructure {
        return structure.kind === StructureKind.Enum;
    }

    /**
     * Gets if the provided structure is a NamedNodeStructure.
     */
    static isNamed<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & NamedNodeStructure {
        switch (structure.kind) {
            case StructureKind.Enum:
            case StructureKind.Interface:
            case StructureKind.JsxAttribute:
            case StructureKind.Namespace:
            case StructureKind.TypeAlias:
            case StructureKind.TypeParameter:
            case StructureKind.ShorthandPropertyAssignment:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a EnumMemberStructure.
     */
    static isEnumMember(structure: Structure & { kind: StructureKind; }): structure is EnumMemberStructure {
        return structure.kind === StructureKind.EnumMember;
    }

    /**
     * Gets if the provided structure is a FunctionDeclarationStructure.
     */
    static isFunction(structure: Structure & { kind: StructureKind; }): structure is FunctionDeclarationStructure {
        return structure.kind === StructureKind.Function;
    }

    /**
     * Gets if the provided structure is a FunctionDeclarationOverloadStructure.
     */
    static isFunctionDeclarationOverload(structure: Structure & { kind: StructureKind; }): structure is FunctionDeclarationOverloadStructure {
        return structure.kind === StructureKind.FunctionOverload;
    }

    /**
     * Gets if the provided structure is a ParameterDeclarationStructure.
     */
    static isParameter(structure: Structure & { kind: StructureKind; }): structure is ParameterDeclarationStructure {
        return structure.kind === StructureKind.Parameter;
    }

    /**
     * Gets if the provided structure is a BindingNamedNodeStructure.
     */
    static isBindingNamed<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & BindingNamedNodeStructure {
        switch (structure.kind) {
            case StructureKind.Parameter:
            case StructureKind.VariableDeclaration:
                return true;
            default:
                return false;
        }
    }

    /**
     * Gets if the provided structure is a ScopeableNodeStructure.
     */
    static isScopeable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ScopeableNodeStructure {
        return structure.kind === StructureKind.Parameter;
    }

    /**
     * Gets if the provided structure is a CallSignatureDeclarationStructure.
     */
    static isCallSignature(structure: Structure & { kind: StructureKind; }): structure is CallSignatureDeclarationStructure {
        return structure.kind === StructureKind.CallSignature;
    }

    /**
     * Gets if the provided structure is a ConstructSignatureDeclarationStructure.
     */
    static isConstructSignature(structure: Structure & { kind: StructureKind; }): structure is ConstructSignatureDeclarationStructure {
        return structure.kind === StructureKind.ConstructSignature;
    }

    /**
     * Gets if the provided structure is a IndexSignatureDeclarationStructure.
     */
    static isIndexSignature(structure: Structure & { kind: StructureKind; }): structure is IndexSignatureDeclarationStructure {
        return structure.kind === StructureKind.IndexSignature;
    }

    /**
     * Gets if the provided structure is a InterfaceDeclarationStructure.
     */
    static isInterface(structure: Structure & { kind: StructureKind; }): structure is InterfaceDeclarationStructure {
        return structure.kind === StructureKind.Interface;
    }

    /**
     * Gets if the provided structure is a ExtendsClauseableNodeStructure.
     */
    static isExtendsClauseable<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ExtendsClauseableNodeStructure {
        return structure.kind === StructureKind.Interface;
    }

    /**
     * Gets if the provided structure is a TypeElementMemberedNodeStructure.
     */
    static isTypeElementMembered<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & TypeElementMemberedNodeStructure {
        return structure.kind === StructureKind.Interface;
    }

    /**
     * Gets if the provided structure is a MethodSignatureStructure.
     */
    static isMethodSignature(structure: Structure & { kind: StructureKind; }): structure is MethodSignatureStructure {
        return structure.kind === StructureKind.MethodSignature;
    }

    /**
     * Gets if the provided structure is a PropertySignatureStructure.
     */
    static isPropertySignature(structure: Structure & { kind: StructureKind; }): structure is PropertySignatureStructure {
        return structure.kind === StructureKind.PropertySignature;
    }

    /**
     * Gets if the provided structure is a JsxAttributeStructure.
     */
    static isJsxAttribute(structure: Structure & { kind: StructureKind; }): structure is JsxAttributeStructure {
        return structure.kind === StructureKind.JsxAttribute;
    }

    /**
     * Gets if the provided structure is a JsxElementStructure.
     */
    static isJsxElement(structure: Structure & { kind: StructureKind; }): structure is JsxElementStructure {
        return structure.kind === StructureKind.JsxElement;
    }

    /**
     * Gets if the provided structure is a JsxSelfClosingElementStructure.
     */
    static isJsxSelfClosingElement(structure: Structure & { kind: StructureKind; }): structure is JsxSelfClosingElementStructure {
        return structure.kind === StructureKind.JsxSelfClosingElement;
    }

    /**
     * Gets if the provided structure is a JsxTagNamedNodeStructure.
     */
    static isJsxTagNamed<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & JsxTagNamedNodeStructure {
        return structure.kind === StructureKind.JsxSelfClosingElement;
    }

    /**
     * Gets if the provided structure is a JsxAttributedNodeStructure.
     */
    static isJsxAttributed<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & JsxAttributedNodeStructure {
        return structure.kind === StructureKind.JsxSelfClosingElement;
    }

    /**
     * Gets if the provided structure is a JsxSpreadAttributeStructure.
     */
    static isJsxSpreadAttribute(structure: Structure & { kind: StructureKind; }): structure is JsxSpreadAttributeStructure {
        return structure.kind === StructureKind.JsxSpreadAttribute;
    }

    /**
     * Gets if the provided structure is a ExportAssignmentStructure.
     */
    static isExportAssignment(structure: Structure & { kind: StructureKind; }): structure is ExportAssignmentStructure {
        return structure.kind === StructureKind.ExportAssignment;
    }

    /**
     * Gets if the provided structure is a ExportDeclarationStructure.
     */
    static isExportDeclaration(structure: Structure & { kind: StructureKind; }): structure is ExportDeclarationStructure {
        return structure.kind === StructureKind.ExportDeclaration;
    }

    /**
     * Gets if the provided structure is a ExportSpecifierStructure.
     */
    static isExportSpecifier(structure: Structure & { kind: StructureKind; }): structure is ExportSpecifierStructure {
        return structure.kind === StructureKind.ExportSpecifier;
    }

    /**
     * Gets if the provided structure is a ImportDeclarationStructure.
     */
    static isImportDeclaration(structure: Structure & { kind: StructureKind; }): structure is ImportDeclarationStructure {
        return structure.kind === StructureKind.ImportDeclaration;
    }

    /**
     * Gets if the provided structure is a ImportSpecifierStructure.
     */
    static isImportSpecifier(structure: Structure & { kind: StructureKind; }): structure is ImportSpecifierStructure {
        return structure.kind === StructureKind.ImportSpecifier;
    }

    /**
     * Gets if the provided structure is a NamespaceDeclarationStructure.
     */
    static isNamespace(structure: Structure & { kind: StructureKind; }): structure is NamespaceDeclarationStructure {
        return structure.kind === StructureKind.Namespace;
    }

    /**
     * Gets if the provided structure is a SourceFileStructure.
     */
    static isSourceFile(structure: Structure & { kind: StructureKind; }): structure is SourceFileStructure {
        return structure.kind === StructureKind.SourceFile;
    }

    /**
     * Gets if the provided structure is a VariableDeclarationStructure.
     */
    static isVariableDeclaration(structure: Structure & { kind: StructureKind; }): structure is VariableDeclarationStructure {
        return structure.kind === StructureKind.VariableDeclaration;
    }

    /**
     * Gets if the provided structure is a VariableStatementStructure.
     */
    static isVariableStatement(structure: Structure & { kind: StructureKind; }): structure is VariableStatementStructure {
        return structure.kind === StructureKind.VariableStatement;
    }

    /**
     * Gets if the provided structure is a TypeAliasDeclarationStructure.
     */
    static isTypeAlias(structure: Structure & { kind: StructureKind; }): structure is TypeAliasDeclarationStructure {
        return structure.kind === StructureKind.TypeAlias;
    }

    /**
     * Gets if the provided structure is a TypeParameterDeclarationStructure.
     */
    static isTypeParameter(structure: Structure & { kind: StructureKind; }): structure is TypeParameterDeclarationStructure {
        return structure.kind === StructureKind.TypeParameter;
    }

    /**
     * Gets if the provided structure is a PropertyAssignmentStructure.
     */
    static isPropertyAssignment(structure: Structure & { kind: StructureKind; }): structure is PropertyAssignmentStructure {
        return structure.kind === StructureKind.PropertyAssignment;
    }

    /**
     * Gets if the provided structure is a ShorthandPropertyAssignmentStructure.
     */
    static isShorthandPropertyAssignment(structure: Structure & { kind: StructureKind; }): structure is ShorthandPropertyAssignmentStructure {
        return structure.kind === StructureKind.ShorthandPropertyAssignment;
    }

    /**
     * Gets if the provided structure is a SpreadAssignmentStructure.
     */
    static isSpreadAssignment(structure: Structure & { kind: StructureKind; }): structure is SpreadAssignmentStructure {
        return structure.kind === StructureKind.SpreadAssignment;
    }

    /**
     * Gets if the provided structure is a ExpressionedNodeStructure.
     */
    static isExpressioned<T extends Structure & { kind: StructureKind; }>(structure: T): structure is T & ExpressionedNodeStructure {
        return structure.kind === StructureKind.SpreadAssignment;
    }
}
