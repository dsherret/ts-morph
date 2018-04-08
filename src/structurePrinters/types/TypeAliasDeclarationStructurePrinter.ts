import {TypeAliasDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "./TypeParameterDeclarationStructurePrinter";
import {NewLineFormattingStructuresPrinter} from "../formatting";

export class TypeAliasDeclarationStructurePrinter extends StructurePrinter<TypeAliasDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly newLineFormattingWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    printTexts(structures: TypeAliasDeclarationStructure[] | undefined) {
        this.newLineFormattingWriter.printText(structures);
    }

    printText(structure: TypeAliasDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierWriter.printText(structure);
        this.writer.write(`type ${structure.name}`);
        this.typeParameterWriter.printTexts(structure.typeParameters);
        this.writer.write(` = ${ structure.type };`);
    }
}
