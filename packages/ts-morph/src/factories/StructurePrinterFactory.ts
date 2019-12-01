// DO NOT EDIT - Automatically maintained by createStructurePrinterFactory.ts
import { Memoize } from "@ts-morph/common";
import * as structurePrinters from "../structurePrinters";
import { SupportedFormatCodeSettings } from "../options";

/**
 * Cached lazy factory for StructurePrinters.
 */
export class StructurePrinterFactory {
    constructor(private readonly _getFormatCodeSettings: () => SupportedFormatCodeSettings) {
    }

    getFormatCodeSettings(): SupportedFormatCodeSettings {
        return this._getFormatCodeSettings();
    }

    @Memoize
    forInitializerExpressionableNode(): structurePrinters.InitializerExpressionableNodeStructurePrinter {
        return new structurePrinters.InitializerExpressionableNodeStructurePrinter();
    }

    @Memoize
    forModifierableNode(): structurePrinters.ModifierableNodeStructurePrinter {
        return new structurePrinters.ModifierableNodeStructurePrinter();
    }

    @Memoize
    forReturnTypedNode(alwaysWrite?: boolean): structurePrinters.ReturnTypedNodeStructurePrinter {
        return new structurePrinters.ReturnTypedNodeStructurePrinter(alwaysWrite);
    }

    @Memoize
    forTypedNode(separator: string, alwaysWrite?: boolean): structurePrinters.TypedNodeStructurePrinter {
        return new structurePrinters.TypedNodeStructurePrinter(separator, alwaysWrite);
    }

    @Memoize
    forClassDeclaration(options: { isAmbient: boolean; }): structurePrinters.ClassDeclarationStructurePrinter {
        return new structurePrinters.ClassDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forClassMember(options: { isAmbient: boolean; }): structurePrinters.ClassMemberStructurePrinter {
        return new structurePrinters.ClassMemberStructurePrinter(this, options);
    }

    @Memoize
    forConstructorDeclaration(options: { isAmbient: boolean; }): structurePrinters.ConstructorDeclarationStructurePrinter {
        return new structurePrinters.ConstructorDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forGetAccessorDeclaration(options: { isAmbient: boolean; }): structurePrinters.GetAccessorDeclarationStructurePrinter {
        return new structurePrinters.GetAccessorDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forMethodDeclaration(options: { isAmbient: boolean; }): structurePrinters.MethodDeclarationStructurePrinter {
        return new structurePrinters.MethodDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forPropertyDeclaration(): structurePrinters.PropertyDeclarationStructurePrinter {
        return new structurePrinters.PropertyDeclarationStructurePrinter(this);
    }

    @Memoize
    forSetAccessorDeclaration(options: { isAmbient: boolean; }): structurePrinters.SetAccessorDeclarationStructurePrinter {
        return new structurePrinters.SetAccessorDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forDecorator(): structurePrinters.DecoratorStructurePrinter {
        return new structurePrinters.DecoratorStructurePrinter(this);
    }

    @Memoize
    forJSDoc(): structurePrinters.JSDocStructurePrinter {
        return new structurePrinters.JSDocStructurePrinter(this);
    }

    @Memoize
    forJSDocTag(options: { printStarsOnNewLine: boolean; }): structurePrinters.JSDocTagStructurePrinter {
        return new structurePrinters.JSDocTagStructurePrinter(this, options);
    }

    @Memoize
    forEnumDeclaration(): structurePrinters.EnumDeclarationStructurePrinter {
        return new structurePrinters.EnumDeclarationStructurePrinter(this);
    }

    @Memoize
    forEnumMember(): structurePrinters.EnumMemberStructurePrinter {
        return new structurePrinters.EnumMemberStructurePrinter(this);
    }

    @Memoize
    forObjectLiteralExpressionProperty(): structurePrinters.ObjectLiteralExpressionPropertyStructurePrinter {
        return new structurePrinters.ObjectLiteralExpressionPropertyStructurePrinter(this);
    }

    @Memoize
    forPropertyAssignment(): structurePrinters.PropertyAssignmentStructurePrinter {
        return new structurePrinters.PropertyAssignmentStructurePrinter(this);
    }

    @Memoize
    forShorthandPropertyAssignment(): structurePrinters.ShorthandPropertyAssignmentStructurePrinter {
        return new structurePrinters.ShorthandPropertyAssignmentStructurePrinter(this);
    }

    @Memoize
    forSpreadAssignment(): structurePrinters.SpreadAssignmentStructurePrinter {
        return new structurePrinters.SpreadAssignmentStructurePrinter(this);
    }

    @Memoize
    forFunctionDeclaration(options: { isAmbient: boolean; }): structurePrinters.FunctionDeclarationStructurePrinter {
        return new structurePrinters.FunctionDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forParameterDeclaration(): structurePrinters.ParameterDeclarationStructurePrinter {
        return new structurePrinters.ParameterDeclarationStructurePrinter(this);
    }

    @Memoize
    forCallSignatureDeclaration(): structurePrinters.CallSignatureDeclarationStructurePrinter {
        return new structurePrinters.CallSignatureDeclarationStructurePrinter(this);
    }

    @Memoize
    forConstructSignatureDeclaration(): structurePrinters.ConstructSignatureDeclarationStructurePrinter {
        return new structurePrinters.ConstructSignatureDeclarationStructurePrinter(this);
    }

    @Memoize
    forIndexSignatureDeclaration(): structurePrinters.IndexSignatureDeclarationStructurePrinter {
        return new structurePrinters.IndexSignatureDeclarationStructurePrinter(this);
    }

    @Memoize
    forInterfaceDeclaration(): structurePrinters.InterfaceDeclarationStructurePrinter {
        return new structurePrinters.InterfaceDeclarationStructurePrinter(this);
    }

    @Memoize
    forMethodSignature(): structurePrinters.MethodSignatureStructurePrinter {
        return new structurePrinters.MethodSignatureStructurePrinter(this);
    }

    @Memoize
    forPropertySignature(): structurePrinters.PropertySignatureStructurePrinter {
        return new structurePrinters.PropertySignatureStructurePrinter(this);
    }

    @Memoize
    forTypeElementMemberedNode(): structurePrinters.TypeElementMemberedNodeStructurePrinter {
        return new structurePrinters.TypeElementMemberedNodeStructurePrinter(this);
    }

    @Memoize
    forTypeElementMember(): structurePrinters.TypeElementMemberStructurePrinter {
        return new structurePrinters.TypeElementMemberStructurePrinter(this);
    }

    @Memoize
    forJsxAttribute(): structurePrinters.JsxAttributeStructurePrinter {
        return new structurePrinters.JsxAttributeStructurePrinter(this);
    }

    @Memoize
    forJsxChildDecider(): structurePrinters.JsxChildDeciderStructurePrinter {
        return new structurePrinters.JsxChildDeciderStructurePrinter(this);
    }

    @Memoize
    forJsxElement(): structurePrinters.JsxElementStructurePrinter {
        return new structurePrinters.JsxElementStructurePrinter(this);
    }

    @Memoize
    forJsxAttributeDecider(): structurePrinters.JsxAttributeDeciderStructurePrinter {
        return new structurePrinters.JsxAttributeDeciderStructurePrinter(this);
    }

    @Memoize
    forJsxSelfClosingElement(): structurePrinters.JsxSelfClosingElementStructurePrinter {
        return new structurePrinters.JsxSelfClosingElementStructurePrinter(this);
    }

    @Memoize
    forJsxSpreadAttribute(): structurePrinters.JsxSpreadAttributeStructurePrinter {
        return new structurePrinters.JsxSpreadAttributeStructurePrinter(this);
    }

    @Memoize
    forExportAssignment(): structurePrinters.ExportAssignmentStructurePrinter {
        return new structurePrinters.ExportAssignmentStructurePrinter(this);
    }

    @Memoize
    forExportDeclaration(): structurePrinters.ExportDeclarationStructurePrinter {
        return new structurePrinters.ExportDeclarationStructurePrinter(this);
    }

    @Memoize
    forImportDeclaration(): structurePrinters.ImportDeclarationStructurePrinter {
        return new structurePrinters.ImportDeclarationStructurePrinter(this);
    }

    @Memoize
    forNamespaceDeclaration(options: { isAmbient: boolean; }): structurePrinters.NamespaceDeclarationStructurePrinter {
        return new structurePrinters.NamespaceDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forNamedImportExportSpecifier(): structurePrinters.NamedImportExportSpecifierStructurePrinter {
        return new structurePrinters.NamedImportExportSpecifierStructurePrinter(this);
    }

    @Memoize
    forSourceFile(options: { isAmbient: boolean; }): structurePrinters.SourceFileStructurePrinter {
        return new structurePrinters.SourceFileStructurePrinter(this, options);
    }

    @Memoize
    forStatementedNode(options: { isAmbient: boolean; }): structurePrinters.StatementedNodeStructurePrinter {
        return new structurePrinters.StatementedNodeStructurePrinter(this, options);
    }

    @Memoize
    forStatement(options: { isAmbient: boolean; }): structurePrinters.StatementStructurePrinter {
        return new structurePrinters.StatementStructurePrinter(this, options);
    }

    @Memoize
    forVariableStatement(): structurePrinters.VariableStatementStructurePrinter {
        return new structurePrinters.VariableStatementStructurePrinter(this);
    }

    @Memoize
    forVariableDeclaration(): structurePrinters.VariableDeclarationStructurePrinter {
        return new structurePrinters.VariableDeclarationStructurePrinter(this);
    }

    @Memoize
    forTypeAliasDeclaration(): structurePrinters.TypeAliasDeclarationStructurePrinter {
        return new structurePrinters.TypeAliasDeclarationStructurePrinter(this);
    }

    @Memoize
    forTypeParameterDeclaration(): structurePrinters.TypeParameterDeclarationStructurePrinter {
        return new structurePrinters.TypeParameterDeclarationStructurePrinter(this);
    }
}
