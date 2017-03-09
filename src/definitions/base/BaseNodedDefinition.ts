import * as ts from "typescript";
import {TsNode} from "./../../compiler";
import {DefinitionFactory} from "./../../factories";
import {BaseDefinition} from "./BaseDefinition";

export class BaseNodedDefinition<T extends ts.Node, U extends TsNode<T>> extends BaseDefinition {
    constructor(protected readonly factory: DefinitionFactory, protected readonly tsNode: U) {
        super();
    }

    getCompilerNode() {
        return this.tsNode.getCompilerNode();
    }
}
