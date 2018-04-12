// DO NOT EDIT - Automatically maintained by createStructurePrinterFactory.ts
import * as structurePrinters from "../structurePrinters";
import {SupportedFormatCodeSettings} from "../options";
import {GlobalContainer} from "../GlobalContainer";

export class StructurePrinterFactory {
    constructor(private readonly global: GlobalContainer) {
    }

    private getFormatCodeSettings(): SupportedFormatCodeSettings {
        return this.global.getFormatCodeSettings();
    }

    forModifierableNode(): structurePrinters.ModifierableNodeStructurePrinter {
        return new structurePrinters.ModifierableNodeStructurePrinter();
    }

    forJSDoc(): structurePrinters.JSDocStructurePrinter {
        return new structurePrinters.JSDocStructurePrinter();
    }

    forDecorator(): structurePrinters.DecoratorStructurePrinter {
        return new structurePrinters.DecoratorStructurePrinter();
    }

    forClassDeclaration(options: { isAmbient: boolean; }): structurePrinters.ClassDeclarationStructurePrinter {
        return new structurePrinters.ClassDeclarationStructurePrinter(options);
    }

    forConstructorDeclaration(options: { isAmbient: boolean; }): structurePrinters.ConstructorDeclarationStructurePrinter {
        return new structurePrinters.ConstructorDeclarationStructurePrinter(options);
    }

    forGetAccessorDeclaration(options: { isAmbient: boolean; }): structurePrinters.GetAccessorDeclarationStructurePrinter {
        return new structurePrinters.GetAccessorDeclarationStructurePrinter(options);
    }

    forMethodDeclaration(options: { isAmbient: boolean; }): structurePrinters.MethodDeclarationStructurePrinter {
        return new structurePrinters.MethodDeclarationStructurePrinter(options);
    }

    forPropertyDeclaration(): structurePrinters.PropertyDeclarationStructurePrinter {
        return new structurePrinters.PropertyDeclarationStructurePrinter();
    }

    forSetAccessorDeclaration(options: { isAmbient: boolean; }): structurePrinters.SetAccessorDeclarationStructurePrinter {
        return new structurePrinters.SetAccessorDeclarationStructurePrinter(options);
    }

    forPropertyAssignment(): structurePrinters.PropertyAssignmentStructurePrinter {
        return new structurePrinters.PropertyAssignmentStructurePrinter();
    }

    forShorthandPropertyAssignment(): structurePrinters.ShorthandPropertyAssignmentStructurePrinter {
        return new structurePrinters.ShorthandPropertyAssignmentStructurePrinter();
    }

    forSpreadAssignment(): structurePrinters.SpreadAssignmentStructurePrinter {
        return new structurePrinters.SpreadAssignmentStructurePrinter();
    }

    forString(): structurePrinters.StringStructurePrinter {
        return new structurePrinters.StringStructurePrinter();
    }

    forEnumDeclaration(): structurePrinters.EnumDeclarationStructurePrinter {
        return new structurePrinters.EnumDeclarationStructurePrinter();
    }

    forEnumMember(): structurePrinters.EnumMemberStructurePrinter {
        return new structurePrinters.EnumMemberStructurePrinter();
    }

    forExportAssignment(): structurePrinters.ExportAssignmentStructurePrinter {
        return new structurePrinters.ExportAssignmentStructurePrinter();
    }

    forExportDeclaration(): structurePrinters.ExportDeclarationStructurePrinter {
        return new structurePrinters.ExportDeclarationStructurePrinter(this.getFormatCodeSettings());
    }

    forImportDeclaration(): structurePrinters.ImportDeclarationStructurePrinter {
        return new structurePrinters.ImportDeclarationStructurePrinter(this.getFormatCodeSettings());
    }

    forNamedImportExportSpecifier(): structurePrinters.NamedImportExportSpecifierStructurePrinter {
        return new structurePrinters.NamedImportExportSpecifierStructurePrinter(this.getFormatCodeSettings());
    }

    forSourceFile(options: { isAmbient: boolean; }): structurePrinters.SourceFileStructurePrinter {
        return new structurePrinters.SourceFileStructurePrinter(this.getFormatCodeSettings(), options);
    }

    forFunctionDeclaration(): structurePrinters.FunctionDeclarationStructurePrinter {
        return new structurePrinters.FunctionDeclarationStructurePrinter();
    }

    forParameterDeclaration(): structurePrinters.ParameterDeclarationStructurePrinter {
        return new structurePrinters.ParameterDeclarationStructurePrinter();
    }

    forCallSignatureDeclaration(): structurePrinters.CallSignatureDeclarationStructurePrinter {
        return new structurePrinters.CallSignatureDeclarationStructurePrinter();
    }

    forConstructSignatureDeclaration(): structurePrinters.ConstructSignatureDeclarationStructurePrinter {
        return new structurePrinters.ConstructSignatureDeclarationStructurePrinter();
    }

    forIndexSignatureDeclaration(): structurePrinters.IndexSignatureDeclarationStructurePrinter {
        return new structurePrinters.IndexSignatureDeclarationStructurePrinter();
    }

    forInterfaceDeclaration(): structurePrinters.InterfaceDeclarationStructurePrinter {
        return new structurePrinters.InterfaceDeclarationStructurePrinter();
    }

    forMethodSignature(): structurePrinters.MethodSignatureStructurePrinter {
        return new structurePrinters.MethodSignatureStructurePrinter();
    }

    forPropertySignature(): structurePrinters.PropertySignatureStructurePrinter {
        return new structurePrinters.PropertySignatureStructurePrinter();
    }

    forTypeElementMemberedNode(): structurePrinters.TypeElementMemberedNodeStructurePrinter {
        return new structurePrinters.TypeElementMemberedNodeStructurePrinter();
    }

    forJsxAttribute(): structurePrinters.JsxAttributeStructurePrinter {
        return new structurePrinters.JsxAttributeStructurePrinter();
    }

    forJsxElement(): structurePrinters.JsxElementStructurePrinter {
        return new structurePrinters.JsxElementStructurePrinter();
    }

    forNamespaceDeclaration(options: { isAmbient: boolean; }): structurePrinters.NamespaceDeclarationStructurePrinter {
        return new structurePrinters.NamespaceDeclarationStructurePrinter(options);
    }

    forBodyText(options: { isAmbient: boolean; }): structurePrinters.BodyTextStructurePrinter {
        return new structurePrinters.BodyTextStructurePrinter(options);
    }

    forStatementedNode(options: { isAmbient: boolean; }): structurePrinters.StatementedNodeStructurePrinter {
        return new structurePrinters.StatementedNodeStructurePrinter(options);
    }

    forVariableDeclaration(): structurePrinters.VariableDeclarationStructurePrinter {
        return new structurePrinters.VariableDeclarationStructurePrinter();
    }

    forVariableStatement(): structurePrinters.VariableStatementStructurePrinter {
        return new structurePrinters.VariableStatementStructurePrinter();
    }

    forTypeAliasDeclaration(): structurePrinters.TypeAliasDeclarationStructurePrinter {
        return new structurePrinters.TypeAliasDeclarationStructurePrinter();
    }

    forTypeParameterDeclaration(): structurePrinters.TypeParameterDeclarationStructurePrinter {
        return new structurePrinters.TypeParameterDeclarationStructurePrinter();
    }
}
