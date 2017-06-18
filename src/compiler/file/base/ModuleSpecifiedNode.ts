import * as ts from "typescript";
import {Node} from "./../../common";
import {replaceStraight} from "./../../../manipulation";

export type ModuleSpecifiedNodeExtensionType = Node<ts.ImportDeclaration | ts.ExportDeclaration>;

export interface ModuleSpecifiedNode {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the import specifier.
     */
    setModuleSpecifier(text: string): this;
    /**
     * Gets the module specifier.
     */
    getModuleSpecifier(): string;
}

export function ModuleSpecifiedNode<T extends Constructor<ModuleSpecifiedNodeExtensionType>>(Base: T): Constructor<ModuleSpecifiedNode> & T {
    return class extends Base implements ModuleSpecifiedNode {
        setModuleSpecifier(text: string) {
            const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
            replaceStraight(this.getSourceFile(), stringLiteral.getStart() + 1, stringLiteral.getWidth() - 2, text);
            return this;
        }

        getModuleSpecifier() {
            const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
            const text = stringLiteral.getText();
            return text.substring(1, text.length - 1);
        }
    };
}
