import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {PropertyNamedNodeStructure} from "./../../../structures";
import {TypeGuards} from "./../../../utils";
import {Node} from "./../../common";
import {PropertyName} from "./../../aliases";
import {callBaseFill} from "./../../callBaseFill";

export type PropertyNamedNodeExtensionType = Node<ts.Node & { name: ts.PropertyName; }>;

export interface PropertyNamedNode {
    getNameNode(): PropertyName;
    getName(): string;
    rename(text: string): this;
}

export function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T {
    return class extends Base implements PropertyNamedNode {
        getNameNode() {
            const compilerNameNode: ts.PropertyName = this.compilerNode.name;
            return this.global.compilerFactory.getNodeFromCompilerNode(compilerNameNode, this.sourceFile) as PropertyName;
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
