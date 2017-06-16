import * as ts from "typescript";
import {Node, Identifier} from "./../common";
import {ImportSpecifier} from "./ImportSpecifier";

export class ImportDeclaration extends Node<ts.ImportDeclaration> {
    /**
     * Gets the module specifier.
     */
    getModuleSpecifier() {
        const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
        const text = stringLiteral.getText();
        return text.substring(1, text.length - 1);
    }

    /**
     * Gets the default import, if it exists.
     */
    getDefaultImport() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return undefined;
        const firstChild = importClause.getFirstChild();
        if (firstChild == null || firstChild.getKind() !== ts.SyntaxKind.Identifier)
            return undefined;
        return firstChild as Identifier;
    }

    /**
     * Gets the namespace import, if it exists.
     */
    getNamespaceImport() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return undefined;
        const namespaceImport = importClause.getFirstChildByKind(ts.SyntaxKind.NamespaceImport);
        if (namespaceImport == null)
            return undefined;
        return namespaceImport.getFirstChildByKind(ts.SyntaxKind.Identifier) as Identifier | undefined;
    }

    /**
     * Gets the named imports.
     */
    getNamedImports(): ImportSpecifier[] {
        const importClause = this.getImportClause();
        if (importClause == null)
            return [];
        const namedImports = importClause.getFirstChildByKind(ts.SyntaxKind.NamedImports);
        if (namedImports == null)
            return [];
        return namedImports.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof ImportSpecifier) as ImportSpecifier[];
    }

    private getImportClause() {
        return this.getFirstChildByKind(ts.SyntaxKind.ImportClause) as Node<ts.ImportClause>;
    }
}
