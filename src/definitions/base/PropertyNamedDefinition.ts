import * as ts from "typescript";
import {TsNode, TsPropertyNamedNode} from "./../../compiler";
import {BaseNodedDefinition} from "./BaseNodedDefinition";

type ExtensionType = BaseNodedDefinition<ts.Node, TsPropertyNamedNode>;

export interface PropertyNamedDefinition {
    getName(): string;
    setName(text: string): this;
}

export function PropertyNamedDefinition<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements PropertyNamedDefinition {
        getName() {
            return this.tsNode.getNameNode().getText();
        }

        setName(text: string) {
            this.tsNode.getNameNode().rename(text);
            return this;
        }
    }
}
