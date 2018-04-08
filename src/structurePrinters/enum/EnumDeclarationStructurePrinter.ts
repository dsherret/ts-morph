import {EnumDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {EnumMemberStructurePrinter} from "./EnumMemberStructurePrinter";

export class EnumDeclarationStructurePrinter extends StructurePrinter<EnumDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this.writer, this);
    private readonly enumMemberWriter = new EnumMemberStructurePrinter(this.writer);

    printTexts(structures: EnumDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(structures);
    }

    printText(structure: EnumDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierWriter.printText(structure);
        this.writer.conditionalWrite(structure.isConst, "const ");
        this.writer.write(`enum ${structure.name} `).inlineBlock(() => {
            this.enumMemberWriter.printTexts(structure.members);
        });
    }
}
