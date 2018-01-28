import * as ts from "typescript";
import {ModuleReference} from "./../aliases";
import {JSDocableNode, NamedNode} from "./../base";
import {Node} from "./../common";
import {Statement} from "./../statement";

export const ImportEqualsDeclarationBase = JSDocableNode(NamedNode(Statement));
export class ImportEqualsDeclaration extends ImportEqualsDeclarationBase<ts.ImportEqualsDeclaration> {
    /**
     * Gets the module reference of the import equals declaration.
     */
    getModuleReference(): ModuleReference {
        return this.getNodeFromCompilerNode(this.compilerNode.moduleReference) as ModuleReference;
    }
}
