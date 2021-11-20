// dprint-ignore-file
import { AssertTrue, IsExact } from "conditional-type-checks";
import { WriterFunction } from "../types";
import { NameableNodeStructure, AsyncableNodeStructure, ImplementsClauseableNodeStructure, JSDocableNodeStructure, AbstractableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, ParameteredNodeStructure, ReturnTypedNodeStructure,
    PropertyNamedNodeStructure, StaticableNodeStructure, TypeParameteredNodeStructure, GeneratorableNodeStructure, QuestionTokenableNodeStructure,
    TypedNodeStructure, ExclamationTokenableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, NamedNodeStructure,
    BindingNamedNodeStructure, ScopeableNodeStructure, ExtendsClauseableNodeStructure, TypeElementMemberedNodeStructure,
    DecoratableNodeStructure, ModuleNamedNodeStructure, OverrideableNodeStructure, AssertionKeyNamedNodeStructure} from "./base";
import { ClassDeclarationStructure, ClassLikeDeclarationBaseStructure, ConstructorDeclarationStructure, ConstructorDeclarationOverloadStructure,
    GetAccessorDeclarationStructure, MethodDeclarationStructure, MethodDeclarationOverloadStructure, PropertyDeclarationStructure,
    SetAccessorDeclarationStructure, ClassStaticBlockDeclarationStructure} from "./class";
import { DecoratorStructure } from "./decorator";
import { JSDocStructure, JSDocTagStructure } from "./doc";
import { EnumDeclarationStructure, EnumMemberStructure } from "./enum";
import { PropertyAssignmentStructure, SpreadAssignmentStructure, ExpressionedNodeStructure, ShorthandPropertyAssignmentStructure } from "./expression";
import { FunctionLikeDeclarationStructure, FunctionDeclarationStructure, FunctionDeclarationOverloadStructure,
    ParameterDeclarationStructure } from "./function";
import { InterfaceDeclarationStructure, CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure,
    MethodSignatureStructure, PropertySignatureStructure } from "./interface";
import { JsxAttributeStructure, JsxElementStructure, JsxSelfClosingElementStructure, JsxTagNamedNodeStructure, JsxAttributedNodeStructure,
    JsxSpreadAttributeStructure } from "./jsx";
import { AssertEntryStructure, ExportAssignmentStructure, ExportDeclarationStructure, ExportSpecifierStructure, ImportDeclarationStructure, ImportSpecifierStructure,
    ModuleDeclarationStructure, SourceFileStructure } from "./module";
import { VariableDeclarationStructure, StatementedNodeStructure, VariableStatementStructure } from "./statement";
import { TypeAliasDeclarationStructure, TypeParameterDeclarationStructure } from "./type";
import { StructureKind } from "./StructureKind";

export interface Structure {
    /** Leading comments or whitespace. */
    leadingTrivia?: string | WriterFunction | (string | WriterFunction)[];
    /** Trailing comments or whitespace. */
    trailingTrivia?: string | WriterFunction | (string | WriterFunction)[];
}

type _assertTriviaEqual = AssertTrue<IsExact<Structure["leadingTrivia"], Structure["trailingTrivia"]>>;

export interface KindedStructure<TKind extends StructureKind> {
    kind: TKind;
}

/** Type guards for use on structures. */
export const Structure = {
    /**
     * Gets if the provided structure has a name.
     */
    hasName<T extends Structure>(structure: T): structure is T & { name: string; } {
        return typeof (structure as any).name === "string";
    },
  /** Gets if the provided structure is a AssertEntryStructure. */
  isAssertEntry(structure: unknown): structure is AssertEntryStructure {
    return (structure as any)?.kind === StructureKind.AssertEntry;
  },
  /** Gets if the provided structure is a AssertionKeyNamedNodeStructure. */
  isAssertionKeyNamed<T>(structure: T): structure is T & AssertionKeyNamedNodeStructure {
    return (structure as any)?.kind === StructureKind.AssertEntry;
  },
  /** Gets if the provided structure is a CallSignatureDeclarationStructure. */
  isCallSignature(structure: unknown): structure is CallSignatureDeclarationStructure {
    return (structure as any)?.kind === StructureKind.CallSignature;
  },
  /** Gets if the provided structure is a JSDocableNodeStructure. */
  isJSDocable<T>(structure: T): structure is T & JSDocableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.CallSignature:
      case StructureKind.Class:
      case StructureKind.ClassStaticBlock:
      case StructureKind.ConstructorOverload:
      case StructureKind.Constructor:
      case StructureKind.ConstructSignature:
      case StructureKind.Enum:
      case StructureKind.EnumMember:
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.GetAccessor:
      case StructureKind.IndexSignature:
      case StructureKind.Interface:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.MethodSignature:
      case StructureKind.Module:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
      case StructureKind.SetAccessor:
      case StructureKind.TypeAlias:
      case StructureKind.VariableStatement:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a SignaturedDeclarationStructure. */
  isSignatured<T>(structure: T): structure is T & SignaturedDeclarationStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.CallSignature:
      case StructureKind.ConstructorOverload:
      case StructureKind.Constructor:
      case StructureKind.ConstructSignature:
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.GetAccessor:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.MethodSignature:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ParameteredNodeStructure. */
  isParametered<T>(structure: T): structure is T & ParameteredNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.CallSignature:
      case StructureKind.ConstructorOverload:
      case StructureKind.Constructor:
      case StructureKind.ConstructSignature:
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.GetAccessor:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.MethodSignature:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ReturnTypedNodeStructure. */
  isReturnTyped<T>(structure: T): structure is T & ReturnTypedNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.CallSignature:
      case StructureKind.ConstructorOverload:
      case StructureKind.Constructor:
      case StructureKind.ConstructSignature:
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.GetAccessor:
      case StructureKind.IndexSignature:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.MethodSignature:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a TypeParameteredNodeStructure. */
  isTypeParametered<T>(structure: T): structure is T & TypeParameteredNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.CallSignature:
      case StructureKind.Class:
      case StructureKind.ConstructorOverload:
      case StructureKind.Constructor:
      case StructureKind.ConstructSignature:
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.GetAccessor:
      case StructureKind.Interface:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.MethodSignature:
      case StructureKind.SetAccessor:
      case StructureKind.TypeAlias:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ClassDeclarationStructure. */
  isClass(structure: unknown): structure is ClassDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Class;
  },
  /** Gets if the provided structure is a ClassLikeDeclarationBaseStructure. */
  isClassLikeDeclarationBase<T>(structure: T): structure is T & ClassLikeDeclarationBaseStructure {
    return (structure as any)?.kind === StructureKind.Class;
  },
  /** Gets if the provided structure is a NameableNodeStructure. */
  isNameable<T>(structure: T): structure is T & NameableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Class:
      case StructureKind.Function:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ImplementsClauseableNodeStructure. */
  isImplementsClauseable<T>(structure: T): structure is T & ImplementsClauseableNodeStructure {
    return (structure as any)?.kind === StructureKind.Class;
  },
  /** Gets if the provided structure is a DecoratableNodeStructure. */
  isDecoratable<T>(structure: T): structure is T & DecoratableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Class:
      case StructureKind.GetAccessor:
      case StructureKind.Method:
      case StructureKind.Parameter:
      case StructureKind.Property:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a AbstractableNodeStructure. */
  isAbstractable<T>(structure: T): structure is T & AbstractableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Class:
      case StructureKind.GetAccessor:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.Property:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a AmbientableNodeStructure. */
  isAmbientable<T>(structure: T): structure is T & AmbientableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Class:
      case StructureKind.Enum:
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.Interface:
      case StructureKind.Module:
      case StructureKind.Property:
      case StructureKind.TypeAlias:
      case StructureKind.VariableStatement:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ExportableNodeStructure. */
  isExportable<T>(structure: T): structure is T & ExportableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Class:
      case StructureKind.Enum:
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.Interface:
      case StructureKind.Module:
      case StructureKind.TypeAlias:
      case StructureKind.VariableStatement:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ClassStaticBlockDeclarationStructure. */
  isClassStaticBlock(structure: unknown): structure is ClassStaticBlockDeclarationStructure {
    return (structure as any)?.kind === StructureKind.ClassStaticBlock;
  },
  /** Gets if the provided structure is a StatementedNodeStructure. */
  isStatemented<T>(structure: T): structure is T & StatementedNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.ClassStaticBlock:
      case StructureKind.Constructor:
      case StructureKind.Function:
      case StructureKind.GetAccessor:
      case StructureKind.Method:
      case StructureKind.Module:
      case StructureKind.SetAccessor:
      case StructureKind.SourceFile:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ConstructorDeclarationOverloadStructure. */
  isConstructorDeclarationOverload(structure: unknown): structure is ConstructorDeclarationOverloadStructure {
    return (structure as any)?.kind === StructureKind.ConstructorOverload;
  },
  /** Gets if the provided structure is a ScopedNodeStructure. */
  isScoped<T>(structure: T): structure is T & ScopedNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.ConstructorOverload:
      case StructureKind.Constructor:
      case StructureKind.GetAccessor:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.Property:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ConstructorDeclarationStructure. */
  isConstructor(structure: unknown): structure is ConstructorDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Constructor;
  },
  /** Gets if the provided structure is a FunctionLikeDeclarationStructure. */
  isFunctionLike<T>(structure: T): structure is T & FunctionLikeDeclarationStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Constructor:
      case StructureKind.Function:
      case StructureKind.GetAccessor:
      case StructureKind.Method:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ConstructSignatureDeclarationStructure. */
  isConstructSignature(structure: unknown): structure is ConstructSignatureDeclarationStructure {
    return (structure as any)?.kind === StructureKind.ConstructSignature;
  },
  /** Gets if the provided structure is a DecoratorStructure. */
  isDecorator(structure: unknown): structure is DecoratorStructure {
    return (structure as any)?.kind === StructureKind.Decorator;
  },
  /** Gets if the provided structure is a EnumDeclarationStructure. */
  isEnum(structure: unknown): structure is EnumDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Enum;
  },
  /** Gets if the provided structure is a NamedNodeStructure. */
  isNamed<T>(structure: T): structure is T & NamedNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Enum:
      case StructureKind.Interface:
      case StructureKind.JsxAttribute:
      case StructureKind.ShorthandPropertyAssignment:
      case StructureKind.TypeAlias:
      case StructureKind.TypeParameter:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a EnumMemberStructure. */
  isEnumMember(structure: unknown): structure is EnumMemberStructure {
    return (structure as any)?.kind === StructureKind.EnumMember;
  },
  /** Gets if the provided structure is a PropertyNamedNodeStructure. */
  isPropertyNamed<T>(structure: T): structure is T & PropertyNamedNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.EnumMember:
      case StructureKind.GetAccessor:
      case StructureKind.Method:
      case StructureKind.MethodSignature:
      case StructureKind.PropertyAssignment:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a InitializerExpressionableNodeStructure. */
  isInitializerExpressionable<T>(structure: T): structure is T & InitializerExpressionableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.EnumMember:
      case StructureKind.Parameter:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
      case StructureKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ExportAssignmentStructure. */
  isExportAssignment(structure: unknown): structure is ExportAssignmentStructure {
    return (structure as any)?.kind === StructureKind.ExportAssignment;
  },
  /** Gets if the provided structure is a ExportDeclarationStructure. */
  isExportDeclaration(structure: unknown): structure is ExportDeclarationStructure {
    return (structure as any)?.kind === StructureKind.ExportDeclaration;
  },
  /** Gets if the provided structure is a ExportSpecifierStructure. */
  isExportSpecifier(structure: unknown): structure is ExportSpecifierStructure {
    return (structure as any)?.kind === StructureKind.ExportSpecifier;
  },
  /** Gets if the provided structure is a FunctionDeclarationOverloadStructure. */
  isFunctionDeclarationOverload(structure: unknown): structure is FunctionDeclarationOverloadStructure {
    return (structure as any)?.kind === StructureKind.FunctionOverload;
  },
  /** Gets if the provided structure is a AsyncableNodeStructure. */
  isAsyncable<T>(structure: T): structure is T & AsyncableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a GeneratorableNodeStructure. */
  isGeneratorable<T>(structure: T): structure is T & GeneratorableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.FunctionOverload:
      case StructureKind.Function:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a FunctionDeclarationStructure. */
  isFunction(structure: unknown): structure is FunctionDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Function;
  },
  /** Gets if the provided structure is a GetAccessorDeclarationStructure. */
  isGetAccessor(structure: unknown): structure is GetAccessorDeclarationStructure {
    return (structure as any)?.kind === StructureKind.GetAccessor;
  },
  /** Gets if the provided structure is a StaticableNodeStructure. */
  isStaticable<T>(structure: T): structure is T & StaticableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.GetAccessor:
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.Property:
      case StructureKind.SetAccessor:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ImportDeclarationStructure. */
  isImportDeclaration(structure: unknown): structure is ImportDeclarationStructure {
    return (structure as any)?.kind === StructureKind.ImportDeclaration;
  },
  /** Gets if the provided structure is a ImportSpecifierStructure. */
  isImportSpecifier(structure: unknown): structure is ImportSpecifierStructure {
    return (structure as any)?.kind === StructureKind.ImportSpecifier;
  },
  /** Gets if the provided structure is a IndexSignatureDeclarationStructure. */
  isIndexSignature(structure: unknown): structure is IndexSignatureDeclarationStructure {
    return (structure as any)?.kind === StructureKind.IndexSignature;
  },
  /** Gets if the provided structure is a ReadonlyableNodeStructure. */
  isReadonlyable<T>(structure: T): structure is T & ReadonlyableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.IndexSignature:
      case StructureKind.Parameter:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a InterfaceDeclarationStructure. */
  isInterface(structure: unknown): structure is InterfaceDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Interface;
  },
  /** Gets if the provided structure is a ExtendsClauseableNodeStructure. */
  isExtendsClauseable<T>(structure: T): structure is T & ExtendsClauseableNodeStructure {
    return (structure as any)?.kind === StructureKind.Interface;
  },
  /** Gets if the provided structure is a TypeElementMemberedNodeStructure. */
  isTypeElementMembered<T>(structure: T): structure is T & TypeElementMemberedNodeStructure {
    return (structure as any)?.kind === StructureKind.Interface;
  },
  /** Gets if the provided structure is a JSDocStructure. */
  isJSDoc(structure: unknown): structure is JSDocStructure {
    return (structure as any)?.kind === StructureKind.JSDoc;
  },
  /** Gets if the provided structure is a JSDocTagStructure. */
  isJSDocTag(structure: unknown): structure is JSDocTagStructure {
    return (structure as any)?.kind === StructureKind.JSDocTag;
  },
  /** Gets if the provided structure is a JsxAttributeStructure. */
  isJsxAttribute(structure: unknown): structure is JsxAttributeStructure {
    return (structure as any)?.kind === StructureKind.JsxAttribute;
  },
  /** Gets if the provided structure is a JsxElementStructure. */
  isJsxElement(structure: unknown): structure is JsxElementStructure {
    return (structure as any)?.kind === StructureKind.JsxElement;
  },
  /** Gets if the provided structure is a JsxSelfClosingElementStructure. */
  isJsxSelfClosingElement(structure: unknown): structure is JsxSelfClosingElementStructure {
    return (structure as any)?.kind === StructureKind.JsxSelfClosingElement;
  },
  /** Gets if the provided structure is a JsxTagNamedNodeStructure. */
  isJsxTagNamed<T>(structure: T): structure is T & JsxTagNamedNodeStructure {
    return (structure as any)?.kind === StructureKind.JsxSelfClosingElement;
  },
  /** Gets if the provided structure is a JsxAttributedNodeStructure. */
  isJsxAttributed<T>(structure: T): structure is T & JsxAttributedNodeStructure {
    return (structure as any)?.kind === StructureKind.JsxSelfClosingElement;
  },
  /** Gets if the provided structure is a JsxSpreadAttributeStructure. */
  isJsxSpreadAttribute(structure: unknown): structure is JsxSpreadAttributeStructure {
    return (structure as any)?.kind === StructureKind.JsxSpreadAttribute;
  },
  /** Gets if the provided structure is a MethodDeclarationOverloadStructure. */
  isMethodDeclarationOverload(structure: unknown): structure is MethodDeclarationOverloadStructure {
    return (structure as any)?.kind === StructureKind.MethodOverload;
  },
  /** Gets if the provided structure is a QuestionTokenableNodeStructure. */
  isQuestionTokenable<T>(structure: T): structure is T & QuestionTokenableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.MethodSignature:
      case StructureKind.Parameter:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a OverrideableNodeStructure. */
  isOverrideable<T>(structure: T): structure is T & OverrideableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.MethodOverload:
      case StructureKind.Method:
      case StructureKind.Parameter:
      case StructureKind.Property:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a MethodDeclarationStructure. */
  isMethod(structure: unknown): structure is MethodDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Method;
  },
  /** Gets if the provided structure is a MethodSignatureStructure. */
  isMethodSignature(structure: unknown): structure is MethodSignatureStructure {
    return (structure as any)?.kind === StructureKind.MethodSignature;
  },
  /** Gets if the provided structure is a ModuleDeclarationStructure. */
  isModule(structure: unknown): structure is ModuleDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Module;
  },
  /** Gets if the provided structure is a ModuleNamedNodeStructure. */
  isModuleNamed<T>(structure: T): structure is T & ModuleNamedNodeStructure {
    return (structure as any)?.kind === StructureKind.Module;
  },
  /** Gets if the provided structure is a ParameterDeclarationStructure. */
  isParameter(structure: unknown): structure is ParameterDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Parameter;
  },
  /** Gets if the provided structure is a BindingNamedNodeStructure. */
  isBindingNamed<T>(structure: T): structure is T & BindingNamedNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Parameter:
      case StructureKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a TypedNodeStructure. */
  isTyped<T>(structure: T): structure is T & TypedNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Parameter:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
      case StructureKind.TypeAlias:
      case StructureKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a ScopeableNodeStructure. */
  isScopeable<T>(structure: T): structure is T & ScopeableNodeStructure {
    return (structure as any)?.kind === StructureKind.Parameter;
  },
  /** Gets if the provided structure is a PropertyAssignmentStructure. */
  isPropertyAssignment(structure: unknown): structure is PropertyAssignmentStructure {
    return (structure as any)?.kind === StructureKind.PropertyAssignment;
  },
  /** Gets if the provided structure is a PropertyDeclarationStructure. */
  isProperty(structure: unknown): structure is PropertyDeclarationStructure {
    return (structure as any)?.kind === StructureKind.Property;
  },
  /** Gets if the provided structure is a ExclamationTokenableNodeStructure. */
  isExclamationTokenable<T>(structure: T): structure is T & ExclamationTokenableNodeStructure {
    switch ((structure as any)?.kind) {
      case StructureKind.Property:
      case StructureKind.VariableDeclaration:
        return true;
      default:
        return false;
    }
  },
  /** Gets if the provided structure is a PropertySignatureStructure. */
  isPropertySignature(structure: unknown): structure is PropertySignatureStructure {
    return (structure as any)?.kind === StructureKind.PropertySignature;
  },
  /** Gets if the provided structure is a SetAccessorDeclarationStructure. */
  isSetAccessor(structure: unknown): structure is SetAccessorDeclarationStructure {
    return (structure as any)?.kind === StructureKind.SetAccessor;
  },
  /** Gets if the provided structure is a ShorthandPropertyAssignmentStructure. */
  isShorthandPropertyAssignment(structure: unknown): structure is ShorthandPropertyAssignmentStructure {
    return (structure as any)?.kind === StructureKind.ShorthandPropertyAssignment;
  },
  /** Gets if the provided structure is a SourceFileStructure. */
  isSourceFile(structure: unknown): structure is SourceFileStructure {
    return (structure as any)?.kind === StructureKind.SourceFile;
  },
  /** Gets if the provided structure is a SpreadAssignmentStructure. */
  isSpreadAssignment(structure: unknown): structure is SpreadAssignmentStructure {
    return (structure as any)?.kind === StructureKind.SpreadAssignment;
  },
  /** Gets if the provided structure is a ExpressionedNodeStructure. */
  isExpressioned<T>(structure: T): structure is T & ExpressionedNodeStructure {
    return (structure as any)?.kind === StructureKind.SpreadAssignment;
  },
  /** Gets if the provided structure is a TypeAliasDeclarationStructure. */
  isTypeAlias(structure: unknown): structure is TypeAliasDeclarationStructure {
    return (structure as any)?.kind === StructureKind.TypeAlias;
  },
  /** Gets if the provided structure is a TypeParameterDeclarationStructure. */
  isTypeParameter(structure: unknown): structure is TypeParameterDeclarationStructure {
    return (structure as any)?.kind === StructureKind.TypeParameter;
  },
  /** Gets if the provided structure is a VariableDeclarationStructure. */
  isVariableDeclaration(structure: unknown): structure is VariableDeclarationStructure {
    return (structure as any)?.kind === StructureKind.VariableDeclaration;
  },
  /** Gets if the provided structure is a VariableStatementStructure. */
  isVariableStatement(structure: unknown): structure is VariableStatementStructure {
    return (structure as any)?.kind === StructureKind.VariableStatement;
  }
} as const;
