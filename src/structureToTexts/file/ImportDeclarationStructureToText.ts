import * as errors from "./../../errors";
import {ImportDeclarationStructure, ImportSpecifierStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class ImportDeclarationStructureToText extends StructureToText<ImportDeclarationStructure> {
    writeText(structure: ImportDeclarationStructure) {
        const hasNamedImport = structure.namedImports != null && structure.namedImports.length > 0;
        // validation
        if (hasNamedImport && structure.namespaceImport != null)
            throw new errors.InvalidOperationError("An import declaration cannot have both a namespace import and a named import.");

        this.writer.write("import");
        // default import
        if (structure.defaultImport != null) {
            this.writer.write(` ${structure.defaultImport}`);
            this.writer.conditionalWrite(hasNamedImport || structure.namespaceImport != null, ",");
        }
        // namespace import
        if (structure.namespaceImport != null)
            this.writer.write(` * as ${structure.namespaceImport}`);
        // named imports
        if (structure.namedImports != null && structure.namedImports.length > 0)
            this.writeNamedImports(structure.namedImports);
        // from keyword
        this.writer.conditionalWrite(structure.defaultImport != null || hasNamedImport || structure.namespaceImport != null, " from");
        this.writer.write(" ");
        this.writer.quote(structure.moduleSpecifier);
        this.writer.write(";");
    }

    private writeNamedImports(namedImports: (ImportSpecifierStructure | string)[]) {
        this.writer.write(" {");
        for (let i = 0; i < namedImports.length; i++) {
            const namedImport = namedImports[i];
            this.writer.conditionalWrite(i > 0, ", ");
            if (typeof namedImport === "string")
                this.writer.write(namedImport);
            else {
                this.writer.write(namedImport.name);
                this.writer.conditionalWrite(namedImport.alias != null, ` as ${namedImport.alias}`);
            }
        }
        this.writer.write("}");
    }
}
