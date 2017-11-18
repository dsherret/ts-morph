import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {PropertyNamedNodeStructure} from "./../../../structures";
import {TypeGuards} from "./../../../utils";
import {Node, Identifier, ComputedPropertyName} from "./../../common";
import {StringLiteral, NumericLiteral} from "./../../literal";
import {callBaseFill} from "./../../callBaseFill";

export type PropertyNamedNodeExtensionType = Node<ts.Node & { name: ts.PropertyName; }>;

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;

export interface PropertyNamedNode {
    getNameNode(): PropertyName;
    getName(): string;
    rename(text: string): this;
}

export function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T {
    return class extends Base implements PropertyNamedNode {
        getNameNode() {
            const compilerNameNode = this.compilerNode.name;

            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                case ts.SyntaxKind.StringLiteral:
                case ts.SyntaxKind.NumericLiteral:
                case ts.SyntaxKind.ComputedPropertyName:
                    return this.global.compilerFactory.getNodeFromCompilerNode(compilerNameNode, this.sourceFile) as PropertyName;
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForNeverValueError(compilerNameNode);
            }
        }

        getName() {
            return this.getNameNode().getText();
        }

        rename(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            this.global.languageService.renameNode(this.getNameNode(), text);
            return this;
        }

        fill(structure: Partial<PropertyNamedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                this.rename(structure.name);

            return this;
        }
    };
}
