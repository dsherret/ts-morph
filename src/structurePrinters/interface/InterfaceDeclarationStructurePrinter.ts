import {InterfaceDeclarationStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {TypeElementMemberedNodeStructurePrinter} from "./TypeElementMemberedNodeStructurePrinter";

export class InterfaceDeclarationStructurePrinter extends StructurePrinter<InterfaceDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this.writer, this);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly typeElementMembersWriter = new TypeElementMemberedNodeStructurePrinter(this.writer);

    printTexts(structures: InterfaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(structures);
    }

    printText(structure: InterfaceDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierWriter.printText(structure);
        this.writer.write(`interface ${structure.name}`);
        this.typeParameterWriter.printTexts(structure.typeParameters);
        this.writer.space();
        if (!ArrayUtils.isNullOrEmpty(structure.extends))
            this.writer.write(`extends ${structure.extends.join(", ")} `);
        this.writer.inlineBlock(() => {
            this.typeElementMembersWriter.printText(structure);
        });
    }
}
