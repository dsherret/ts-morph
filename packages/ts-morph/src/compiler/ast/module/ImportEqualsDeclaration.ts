import { errors, ts } from "@ts-morph/common";
import { ModuleReference } from "../aliases";
import { JSDocableNode, NamedNode } from "../base";
import { Statement } from "../statement";
import { SourceFile } from "./SourceFile";
import { Node } from "../common";

const createBase = <T extends typeof Statement>(ctor: T) => JSDocableNode(NamedNode(ctor));
export const ImportEqualsDeclarationBase = createBase(Statement);
export class ImportEqualsDeclaration extends ImportEqualsDeclarationBase<ts.ImportEqualsDeclaration> {
    /**
     * Gets the module reference of the import equals declaration.
     */
    getModuleReference(): ModuleReference {
        return this._getNodeFromCompilerNode(this.compilerNode.moduleReference);
    }

    /**
     * Gets if the external module reference is relative.
     */
    isExternalModuleReferenceRelative() {
        const moduleReference = this.getModuleReference();
        if (!Node.isExternalModuleReference(moduleReference))
            return false;

        return moduleReference.isRelative();
    }

    /**
     * Sets the external module reference.
     * @param externalModuleReference - External module reference as a string.
     */
    setExternalModuleReference(externalModuleReference: string): this;
    /**
     * Sets the external module reference.
     * @param sourceFile - Source file to set the external module reference to.
     */
    setExternalModuleReference(sourceFile: SourceFile): this;
    setExternalModuleReference(textOrSourceFile: string | SourceFile) {
        const text = typeof textOrSourceFile === "string" ? textOrSourceFile : this._sourceFile.getRelativePathAsModuleSpecifierTo(textOrSourceFile);
        const moduleReference = this.getModuleReference();
        if (Node.isExternalModuleReference(moduleReference) && moduleReference.getExpression() != null)
            moduleReference.getExpressionOrThrow().replaceWithText(writer => writer.quote(text));
        else
            moduleReference.replaceWithText(writer => writer.write("require(").quote(text).write(")"));
        return this;
    }

    /**
     * Gets the source file referenced in the external module reference or throws if it doesn't exist.
     */
    getExternalModuleReferenceSourceFileOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExternalModuleReferenceSourceFile(),
            "Expected to find an external module reference's referenced source file.");
    }

    /**
     * Gets the source file referenced in the external module reference or returns undefined if it doesn't exist.
     */
    getExternalModuleReferenceSourceFile() {
        const moduleReference = this.getModuleReference();
        if (!Node.isExternalModuleReference(moduleReference))
            return undefined;
        return moduleReference.getReferencedSourceFile();
    }
}
