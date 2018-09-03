// DO NOT EDIT - Automatically maintained by createStructurePrinterFactory.ts
import * as structurePrinters from "../structurePrinters";
import { SupportedFormatCodeSettings } from "../options";
import { Memoize } from "../utils";

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
        return new structurePrinters.InitializerExpressionableNodeStructurePrinter(this);
    }

    @Memoize
    forModifierableNode(): structurePrinters.ModifierableNodeStructurePrinter {
        return new structurePrinters.ModifierableNodeStructurePrinter(this);
    }

    @Memoize
    forReturnTypedNode(alwaysWrite?: boolean): structurePrinters.ReturnTypedNodeStructurePrinter {
        return new structurePrinters.ReturnTypedNodeStructurePrinter(this, alwaysWrite);
    }

    @Memoize
    forTypedNode(separator: string, alwaysWrite?: boolean): structurePrinters.TypedNodeStructurePrinter {
        return new structurePrinters.TypedNodeStructurePrinter(this, separator, alwaysWrite);
    }

    @Memoize
    forClassDeclaration(options: { isAmbient: boolean; }): structurePrinters.ClassDeclarationStructurePrinter {
        return new structurePrinters.ClassDeclarationStructurePrinter(this, options);
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
    forDecorator(): structurePrinters.DecoratorStructurePrinter {
        return new structurePrinters.DecoratorStructurePrinter(this);
    }

    @Memoize
    forJSDoc(): structurePrinters.JSDocStructurePrinter {
        return new structurePrinters.JSDocStructurePrinter(this);
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
    forNamedImportExportSpecifier(): structurePrinters.NamedImportExportSpecifierStructurePrinter {
        return new structurePrinters.NamedImportExportSpecifierStructurePrinter(this);
    }

    @Memoize
    forSourceFile(options: { isAmbient: boolean; }): structurePrinters.SourceFileStructurePrinter {
        return new structurePrinters.SourceFileStructurePrinter(this, options);
    }

    @Memoize
    forFunctionDeclaration(): structurePrinters.FunctionDeclarationStructurePrinter {
        return new structurePrinters.FunctionDeclarationStructurePrinter(this);
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
    forJsxAttribute(): structurePrinters.JsxAttributeStructurePrinter {
        return new structurePrinters.JsxAttributeStructurePrinter(this);
    }

    @Memoize
    forJsxElement(): structurePrinters.JsxElementStructurePrinter {
        return new structurePrinters.JsxElementStructurePrinter(this);
    }

    @Memoize
    forNamespaceDeclaration(options: { isAmbient: boolean; }): structurePrinters.NamespaceDeclarationStructurePrinter {
        return new structurePrinters.NamespaceDeclarationStructurePrinter(this, options);
    }

    @Memoize
    forBodyText(options: { isAmbient: boolean; }): structurePrinters.BodyTextStructurePrinter {
        return new structurePrinters.BodyTextStructurePrinter(this, options);
    }

    @Memoize
    forStatementedNode(options: { isAmbient: boolean; }): structurePrinters.StatementedNodeStructurePrinter {
        return new structurePrinters.StatementedNodeStructurePrinter(this, options);
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
