import CodeBlockWriter from "code-block-writer";
import {InterfaceDeclarationStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {TypeElementMemberedNodeStructurePrinter} from "./TypeElementMemberedNodeStructurePrinter";

export class InterfaceDeclarationStructurePrinter extends StructurePrinter<InterfaceDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly typeElementMembersWriter = new TypeElementMemberedNodeStructurePrinter();

    printTexts(writer: CodeBlockWriter, structures: InterfaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: InterfaceDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierWriter.printText(writer, structure);
        writer.write(`interface ${structure.name}`);
        this.typeParameterWriter.printTextsWithBrackets(writer, structure.typeParameters);
        writer.space();
        if (!ArrayUtils.isNullOrEmpty(structure.extends))
            writer.write(`extends ${structure.extends.join(", ")} `);
        writer.inlineBlock(() => {
            this.typeElementMembersWriter.printText(writer, structure);
        });
    }
}
