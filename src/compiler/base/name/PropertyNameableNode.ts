// this file might be useful in the future...
/*
import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {PropertyNameableNodeStructure} from "./../../../structures";
import {TypeGuards} from "./../../../utils";
import {Node} from "./../../common";
import {callBaseFill} from "./../../callBaseFill";
import {PropertyName} from "./../../aliases";

export type PropertyNameableNodeExtensionType = Node<ts.Node & { name?: ts.PropertyName; }>;

export interface PropertyNameableNode {
    getNameNode(): PropertyName | undefined;
    getNameNodeOrThrow(): PropertyName;
    getName(): string | undefined;
    getNameOrThrow(): string;
    rename(text: string): this;
}

export function PropertyNameableNode<T extends Constructor<PropertyNameableNodeExtensionType>>(Base: T): Constructor<PropertyNameableNode> & T {
    return class extends Base implements PropertyNameableNode {
        getNameNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getNameNode(), "Expected to find a name node.");
        }

        getNameNode() {
            const compilerNameNode: ts.PropertyName | undefined = this.compilerNode.name;
            if (compilerNameNode == null)
                return undefined;
            return this.getNodeFromCompilerNode(compilerNameNode) as PropertyName;
        }

        getNameOrThrow() {
            return errors.throwIfNullOrUndefined(this.getName(), "Expected to find a name.");
        }

        getName() {
            const node = this.getNameNode();
            return node == null ? undefined : node.getText();
        }

        rename(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            const node = this.getNameNode();
            if (node == null)
                throw new errors.InvalidOperationError("Cannot rename a node that does not have a name.");
            this.global.languageService.renameNode(node, text);
            return this;
        }

        fill(structure: Partial<PropertyNameableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                this.rename(structure.name);

            return this;
        }
    };
}

*/
