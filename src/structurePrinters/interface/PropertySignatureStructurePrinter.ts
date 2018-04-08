import {StringUtils} from "../../utils";
import {PropertySignatureStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {JSDocStructurePrinter} from "../doc";

export class PropertySignatureStructurePrinter extends StructurePrinter<PropertySignatureStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierableWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    printTexts(structures: PropertySignatureStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: PropertySignatureStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierableWriter.printText(structure);
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (!StringUtils.isNullOrWhitespace(structure.type))
            this.writer.write(`: ${structure.type}`);
        if (!StringUtils.isNullOrWhitespace(structure.initializer))
            this.writer.write(` = ${structure.initializer}`); // why would someone write an initializer?
        this.writer.write(";");
    }
}
