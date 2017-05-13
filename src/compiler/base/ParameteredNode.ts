import * as ts from "typescript";
import {Node} from "./../common";
import {ParameterDeclaration} from "./../function/ParameterDeclaration";

export type ParameteredNodeExtensionType = Node<ts.Node & { parameters: ts.NodeArray<ts.ParameterDeclaration>; }>;

export interface ParameteredNode {
    /**
     * Gets all the parameters of the node.
     */
    getParameters(): ParameterDeclaration[];
}

export function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T {
    return class extends Base implements ParameteredNode {
        getParameters() {
            return this.node.parameters.map(p => this.factory.getParameterDeclaration(p));
        }
    };
}
