import {TypeAliasDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class TypeAliasDeclarationStructureToText extends StructureToText<TypeAliasDeclarationStructure> {
    writeText(structure: TypeAliasDeclarationStructure) {
        this.writer.write(`type ${structure.name} = ${structure.type};`);
    }
}
