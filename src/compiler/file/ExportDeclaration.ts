import * as ts from "typescript";
import * as errors from "./../../errors";
import {ExportSpecifierStructure} from "./../../structures";
import {replaceStraight, insertStraight, verifyAndGetIndex, insertIntoCommaSeparatedNodes} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {Node, Identifier} from "./../common";
import {ExportSpecifier} from "./ExportSpecifier";

export class ExportDeclaration extends Node<ts.ExportDeclaration> {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the import specifier.
     */
    setModuleSpecifier(text: string) {
        const stringLiteral = this.getLastChildByKind(ts.SyntaxKind.StringLiteral);

        if (stringLiteral == null) {
            const semiColonToken = this.getLastChildIfKind(ts.SyntaxKind.SemicolonToken);
            const stringChar = this.factory.getLanguageService().getStringChar();
            insertStraight({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                newCode: ` from ${stringChar}${text}${stringChar}`,
                parent: this
            });
        }
        else
            replaceStraight(this.getSourceFile(), stringLiteral.getStart() + 1, stringLiteral.getWidth() - 2, text);

        return this;
    }

    /**
     * Gets the module specifier or undefined if it doesn't exist.
     */
    getModuleSpecifier() {
        const stringLiteral = this.getLastChildByKind(ts.SyntaxKind.StringLiteral);
        if (stringLiteral == null)
            return undefined;
        const text = stringLiteral.getText();
        return text.substring(1, text.length - 1);
    }

    /**
     * Gets if the module specifier exists
     */
    hasModuleSpecifier() {
        return this.getLastChildByKind(ts.SyntaxKind.StringLiteral) != null;
    }

    /**
     * Gets if this export declaration is a namespace export.
     */
    isNamespaceExport() {
        return !this.hasNamedExports();
    }

    /**
     * Gets if the export declaration has named exports.
     */
    hasNamedExports() {
        return this.getFirstChildByKind(ts.SyntaxKind.NamedExports) != null;
    }

    /**
     * Add a named export.
     * @param structure - Structure that represents the named export.
     */
    addNamedExport(structure: ExportSpecifierStructure) {
        return this.addNamedExports([structure])[0];
    }

    /**
     * Add named exports.
     * @param structures - Structures that represent the named exports.
     */
    addNamedExports(structures: ExportSpecifierStructure[]) {
        return this.insertNamedExports(this.getNamedExports().length, structures);
    }

    /**
     * Insert a named export.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named export.
     */
    insertNamedExport(index: number, structure: ExportSpecifierStructure) {
        return this.insertNamedExports(index, [structure])[0];
    }

    /**
     * Inserts named exports into the export declaration.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the named exports.
     */
    insertNamedExports(index: number, structures: ExportSpecifierStructure[]) {
        if (ArrayUtils.isNullOrEmpty(structures))
                return [];

        const namedExports = this.getNamedExports();
        const codes = structures.map(s => {
            let text = s.name;
            if (s.alias != null && s.alias.length > 0)
                text += ` as ${s.alias}`;
            return text;
        });
        index = verifyAndGetIndex(index, namedExports.length);

        if (namedExports.length === 0) {
            const asteriskToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.AsteriskToken);
            insertStraight({
                insertPos: asteriskToken.getStart(),
                parent: this,
                newCode: `{${codes.join(", ")}}`,
                replacing: {
                    nodes: [asteriskToken],
                    length: 1
                }
            });
        }
        else {
            insertIntoCommaSeparatedNodes(this.getSourceFile(), namedExports, index, codes);
        }

        return this.getNamedExports().slice(index, index + structures.length);
    }

    /**
     * Gets the named exports.
     */
    getNamedExports(): ExportSpecifier[] {
        const namedExports = this.getFirstChildByKind(ts.SyntaxKind.NamedExports);
        if (namedExports == null)
            return [];
        return namedExports.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof ExportSpecifier) as ExportSpecifier[];
    }
}
