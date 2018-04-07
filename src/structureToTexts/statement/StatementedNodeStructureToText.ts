import CodeBlockWriter from "code-block-writer";
import {StatementedNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {ClassDeclarationStructureToText} from "../class";
import {InterfaceDeclarationStructureToText} from "../interface";
import {EnumDeclarationStructureToText} from "../enum";
import {FunctionDeclarationStructureToText} from "../function";
import {NamespaceDeclarationStructureToText} from "../namespace";
import {TypeAliasDeclarationStructureToText} from "../types";

export class StatementedNodeStructureToText extends StructureToText<StatementedNodeStructure> {
    private readonly classWriter = new ClassDeclarationStructureToText(this.writer);
    private readonly interfaceWriter = new InterfaceDeclarationStructureToText(this.writer);
    private readonly enumWriter = new EnumDeclarationStructureToText(this.writer);
    private readonly functionWriter = new FunctionDeclarationStructureToText(this.writer);
    private readonly namespaceWriter = new NamespaceDeclarationStructureToText(this.writer);
    private readonly typeAliasWriter = new TypeAliasDeclarationStructureToText(this.writer);

    writeText(structure: StatementedNodeStructure) {
        conditionalBlankLine(this.writer, structure.typeAliases);
        this.typeAliasWriter.writeTexts(structure.typeAliases);

        conditionalBlankLine(this.writer, structure.interfaces);
        this.interfaceWriter.writeTexts(structure.interfaces);

        conditionalBlankLine(this.writer, structure.enums);
        this.enumWriter.writeTexts(structure.enums);

        conditionalBlankLine(this.writer, structure.functions);
        this.functionWriter.writeTexts(structure.functions);

        conditionalBlankLine(this.writer, structure.classes);
        this.classWriter.writeTexts(structure.classes);

        conditionalBlankLine(this.writer, structure.namespaces);
        this.namespaceWriter.writeTexts(structure.namespaces);

        function conditionalBlankLine(writer: CodeBlockWriter, structures: any[] | undefined) {
            if (!writer.isAtStartOfFirstLineOfBlock() && !ArrayUtils.isNullOrEmpty(structures))
                writer.blankLine();
        }
    }
}
