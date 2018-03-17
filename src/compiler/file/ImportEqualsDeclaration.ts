import {ts} from "../../typescript";
import * as errors from "../../errors";
import {TypeGuards} from "../../utils";
import {ModuleReference} from "../aliases";
import {JSDocableNode, NamedNode} from "../base";
import {Node} from "../common";
import {Statement} from "../statement";
import {SourceFile} from "./SourceFile";

export const ImportEqualsDeclarationBase = JSDocableNode(NamedNode(Statement));
export class ImportEqualsDeclaration extends ImportEqualsDeclarationBase<ts.ImportEqualsDeclaration> {
    /**
     * Gets the module reference of the import equals declaration.
     */
    getModuleReference(): ModuleReference {
        return this.getNodeFromCompilerNode<ModuleReference>(this.compilerNode.moduleReference);
    }

    /**
     * Gets the source file referenced in the external module reference or throws if it doesn't exist.
     */
    getExternalModuleReferenceSourceFileOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExternalModuleReferenceSourceFile(), "Expected to find an external module reference's referenced source file.");
    }

    /**
     * Gets the source file referenced in the external module reference or returns undefined if it doesn't exist.
     */
    getExternalModuleReferenceSourceFile() {
        const moduleReference = this.getModuleReference();
        if (!TypeGuards.isExternalModuleReference(moduleReference))
            return undefined;
        return moduleReference.getReferencedSourceFile();
    }
}
