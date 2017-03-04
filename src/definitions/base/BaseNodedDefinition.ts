import * as ts from "typescript";
import {TsNode} from "./../../compiler";
import {BaseDefinition} from "./BaseDefinition";

export abstract class BaseNodedDefinition<T extends ts.Node, U extends TsNode<T>> extends BaseDefinition {
    protected constructor(protected readonly tsNode: U) {
        super();
    }

    getUnderlyingNode() {
        return this.tsNode;
    }
}
