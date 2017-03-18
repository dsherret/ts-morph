import * as ts from "typescript";
import {Node} from "./../common";

export type ExportedNodeExtensionType = Node<ts.Node>;

export interface ExportedNode extends ExportedNodeExtensionType {
    hasExportKeyword(): boolean;
    getExportKeyword(): Node<ts.Node> | undefined;
}

export function ExportedNode<T extends Constructor<ExportedNodeExtensionType>>(Base: T): Constructor<ExportedNode> & T {
    return class extends Base implements ExportedNode {
        /**
         * If the node has the export keyword.
         */
        hasExportKeyword() {
            return this.getExportKeyword() != null;
        }

        /**
         * Gets the export keyword or undefined if none exists.
         */
        getExportKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
        }
    };
}
