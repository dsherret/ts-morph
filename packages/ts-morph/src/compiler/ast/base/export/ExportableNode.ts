import { errors, SyntaxKind } from "@ts-morph/common";
import { ExportableNodeStructure } from "../../../../structures";
import { Constructor } from "../../../../types";
import { callBaseSet } from "../../callBaseSet";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { Node } from "../../common";
import { ModifierableNode } from "../ModifierableNode";
import { ExportGetableNode } from "./ExportGetableNode";

export type ExportableNodeExtensionType = Node & ModifierableNode;

export interface ExportableNode extends ExportGetableNode {
    /**
     * Sets if this node is a default export of a file.
     * @param value - If it should be a default export or not.
     */
    setIsDefaultExport(value: boolean): this;
    /**
     * Sets if the node is exported.
     *
     * Note: Will remove the default keyword if set.
     * @param value - If it should be exported or not.
     */
    setIsExported(value: boolean): this;
}

export function ExportableNode<T extends Constructor<ExportableNodeExtensionType>>(Base: T): Constructor<ExportableNode> & T {
    return apply(ExportGetableNode(Base));
}

// couldn't figure out how to inline this and make the compiler happy
function apply<T extends Constructor<ExportableNodeExtensionType & ExportGetableNode>>(Base: T) {
    return class extends Base implements ExportableNode {
        setIsDefaultExport(value: boolean) {
            if (value === this.isDefaultExport())
                return this;

            if (value && !Node.isSourceFile(this.getParentOrThrow()))
                throw new errors.InvalidOperationError("The parent must be a source file in order to set this node as a default export.");

            // remove any existing default export
            const sourceFile = this.getSourceFile();
            const fileDefaultExportSymbol = sourceFile.getDefaultExportSymbol();

            if (fileDefaultExportSymbol != null)
                sourceFile.removeDefaultExport(fileDefaultExportSymbol);

            if (!value)
                return this;

            // set this node as the one to default export
            if (Node.hasName(this) && shouldWriteAsSeparateStatement.call(this)) {
                const parentSyntaxList = this.getFirstAncestorByKindOrThrow(SyntaxKind.SyntaxList);
                const name = this.getName();

                parentSyntaxList.insertChildText(this.getChildIndex() + 1, writer => {
                    writer.newLine().write(`export default ${name};`);
                });
            }
            else {
                this.addModifier("export");
                this.addModifier("default");
            }

            return this;

            function shouldWriteAsSeparateStatement(this: Node) {
                if (Node.isEnumDeclaration(this) || Node.isNamespaceDeclaration(this) || Node.isTypeAliasDeclaration(this))
                    return true;
                if (Node.isAmbientableNode(this) && this.isAmbient())
                    return true;
                return false;
            }
        }

        setIsExported(value: boolean) {
            // remove the default keyword if it exists
            if (Node.isSourceFile(this.getParentOrThrow()))
                this.toggleModifier("default", false);

            this.toggleModifier("export", value);

            return this;
        }

        set(structure: Partial<ExportableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.isExported != null)
                this.setIsExported(structure.isExported);
            if (structure.isDefaultExport != null)
                this.setIsDefaultExport(structure.isDefaultExport);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<ExportableNodeStructure>(Base.prototype, this, {
                isExported: this.hasExportKeyword(),
                isDefaultExport: this.hasDefaultKeyword()
            });
        }
    };
}
