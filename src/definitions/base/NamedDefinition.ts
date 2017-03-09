import * as ts from "typescript";
import {TsNode} from "./../../compiler";
import {BaseNodedDefinition} from "./BaseNodedDefinition";

/*export function NamedDefinition<BC extends new(...args: any[]) => BaseNodedDefinition<ts.Node, TsNode<ts.Node>>>(Base: BC) {
    return class extends Base {
        getName() {
            return this.tsNode.getNameNode().getText();
        }

        setName(text: string) {
            this.tsNode.getNameNode().rename(text);
            return this;
        }
    }
}*/
