import CodeBlockWriter from "code-block-writer";
import {EnumDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {EnumMemberStructurePrinter} from "./EnumMemberStructurePrinter";

export class EnumDeclarationStructurePrinter extends StructurePrinter<EnumDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);
    private readonly enumMemberWriter = new EnumMemberStructurePrinter();

    printTexts(writer: CodeBlockWriter, structures: EnumDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: EnumDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierWriter.printText(writer, structure);
        writer.conditionalWrite(structure.isConst, "const ");
        writer.write(`enum ${structure.name} `).inlineBlock(() => {
            this.enumMemberWriter.printTexts(writer, structure.members);
        });
    }
}
