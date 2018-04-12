import CodeBlockWriter from "code-block-writer";
import {TypeAliasDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "./TypeParameterDeclarationStructurePrinter";
import {NewLineFormattingStructuresPrinter} from "../formatting";

export class TypeAliasDeclarationStructurePrinter extends StructurePrinter<TypeAliasDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly newLineFormattingWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: TypeAliasDeclarationStructure[] | undefined) {
        this.newLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: TypeAliasDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierWriter.printText(writer, structure);
        writer.write(`type ${structure.name}`);
        this.typeParameterWriter.printTextsWithBrackets(writer, structure.typeParameters);
        writer.write(` = ${ structure.type };`);
    }
}
