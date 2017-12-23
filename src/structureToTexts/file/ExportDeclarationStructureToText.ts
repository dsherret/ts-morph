import * as errors from "./../../errors";
import {ExportDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class ExportDeclarationStructureToText extends StructureToText<ExportDeclarationStructure> {
    writeText(structure: ExportDeclarationStructure) {
        const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
        this.writer.write("export");
        if (structure.namedExports != null && structure.namedExports.length > 0) {
            this.writer.write(" {");
            for (let i = 0; i < structure.namedExports.length; i++) {
                const namedExport = structure.namedExports[i];
                this.writer.conditionalWrite(i > 0, ", ");
                this.writer.write(namedExport.name);
                this.writer.conditionalWrite(namedExport.alias != null, ` as ${namedExport.alias}`);
            }
            this.writer.write("}");
        }
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
}
