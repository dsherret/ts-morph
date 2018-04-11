import CodeBlockWriter from "code-block-writer";
﻿import {StringUtils} from "../../utils";
import {PropertySignatureStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {JSDocStructurePrinter} from "../doc";

export class PropertySignatureStructurePrinter extends StructurePrinter<PropertySignatureStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierableWriter = new ModifierableNodeStructurePrinter();
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: PropertySignatureStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: PropertySignatureStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierableWriter.printText(writer, structure);
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (!StringUtils.isNullOrWhitespace(structure.type))
            writer.write(`: ${structure.type}`);
        if (!StringUtils.isNullOrWhitespace(structure.initializer))
            writer.write(` = ${structure.initializer}`); // why would someone write an initializer?
        writer.write(";");
    }
}
