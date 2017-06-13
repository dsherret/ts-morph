import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node, Identifier} from "./../common";

export const ImportDeclarationBase = Node;
export class ImportDeclaration extends ImportDeclarationBase<ts.ImportDeclaration> {
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
     * Gets the namespace import identifier, if it exists.
     */
    getNamespaceImportIdentifier() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return undefined;
        const firstChild = importClause.getFirstChildByKind(ts.SyntaxKind.NamespaceImport);
        if (firstChild == null)
            return undefined;
        return firstChild.getFirstChildByKind(ts.SyntaxKind.Identifier) as Identifier | undefined;
    }

    private getImportClause() {
        return this.getFirstChildByKind(ts.SyntaxKind.ImportClause);
    }
}
