import { ts } from "@ts-morph/common";
import { Node } from "../common";
import { ImportSpecifier } from "./ImportSpecifier";

export const NamedImportsBase = Node;
export class NamedImports extends NamedImportsBase<ts.NamedImports> {
    /** Gets the import specifiers. */
    getElements(): ImportSpecifier[] {
        return this.compilerNode.elements.map(e => this._getNodeFromCompilerNode(e));
    }
}
