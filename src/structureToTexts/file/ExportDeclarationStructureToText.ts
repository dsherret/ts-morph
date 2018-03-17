import * as errors from "./../../errors";
import {ExportDeclarationStructure, ExportSpecifierStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class ExportDeclarationStructureToText extends StructureToText<ExportDeclarationStructure> {
    writeText(structure: ExportDeclarationStructure) {
        const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
        this.writer.write("export");
        if (structure.namedExports != null && structure.namedExports.length > 0)
            this.writeNamedExports(structure.namedExports);
        else if (!hasModuleSpecifier)
            this.writer.write(` {}`);
        else
            this.writer.write(` *`);

        if (hasModuleSpecifier) {
            this.writer.write(" from ");
            this.writer.quote(structure.moduleSpecifier!);
        }
        this.writer.write(";");
    }

    private writeNamedExports(namedExports: (ExportSpecifierStructure | string)[]) {
        this.writer.write(" {");
        for (let i = 0; i < namedExports.length; i++) {
            const namedExport = namedExports[i];
            this.writer.conditionalWrite(i > 0, ", ");
            if (typeof namedExport === "string")
                this.writer.write(namedExport);
            else {
                this.writer.write(namedExport.name);
                this.writer.conditionalWrite(namedExport.alias != null, ` as ${namedExport.alias}`);
            }
        }
        this.writer.write("}");
    }
}
