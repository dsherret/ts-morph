import {TypeAliasDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {TypeParameterDeclarationStructureToText} from "./TypeParameterDeclarationStructureToText";
import {NewLineFormattingStructuresToText} from "../formatting";

export class TypeAliasDeclarationStructureToText extends StructureToText<TypeAliasDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly newLineFormattingWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: TypeAliasDeclarationStructure[] | undefined) {
        this.newLineFormattingWriter.writeText(structures);
    }

    writeText(structure: TypeAliasDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierWriter.writeText(structure);
        this.writer.write(`type ${structure.name}`);
        this.typeParameterWriter.writeTexts(structure.typeParameters);
        this.writer.write(` = ${ structure.type };`);
    }
}
