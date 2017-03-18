import * as ts from "typescript";
import {Node} from "./../common";

export type ExportableNodeExtensionType = Node<ts.Node>;

export interface ExportableNode extends ExportableNodeExtensionType {
    hasExportKeyword(): boolean;
    getExportKeyword(): Node<ts.Node> | undefined;
}

export function ExportableNode<T extends Constructor<ExportableNodeExtensionType>>(Base: T): Constructor<ExportableNode> & T {
    return class extends Base implements ExportableNode {
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
