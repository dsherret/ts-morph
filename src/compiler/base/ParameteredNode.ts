import * as ts from "typescript";
import {ReturnTypedNode} from "./ReturnTypedNode";
import {TypeParameteredNode} from "./TypeParameteredNode";
import {Node} from "./../common";
import {ParameterDeclaration} from "./../function/ParameterDeclaration";

export type ParameteredNodeExtensionType = Node<ts.Node & { parameters: ts.NodeArray<ts.ParameterDeclaration>; }>;

export interface ParameteredNode {
    getParameters(): ParameterDeclaration[];
}

export function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T {
    return class extends Base implements ParameteredNode {
        /**
         * Gets all the parameters of the node.
         */
        getParameters() {
            return this.node.parameters.map(p => this.factory.getParameterDeclaration(p));
        }
    };
}