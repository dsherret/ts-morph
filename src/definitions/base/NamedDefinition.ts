import * as ts from "typescript";
import {TsNode, TsNamedNode} from "./../../compiler";
import {BaseNodedDefinition} from "./BaseNodedDefinition";

type ExtensionType = BaseNodedDefinition<ts.Node, TsNamedNode>;

export interface NamedDefinition {
    getName(): string;
    setName(text: string): this;
}

export function NamedDefinition<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements NamedDefinition {
        getName() {
            return this.tsNode.getNameNode().getText();
        }

        setName(text: string) {
            this.tsNode.getNameNode().rename(text);
            return this;
        }
    }
}
