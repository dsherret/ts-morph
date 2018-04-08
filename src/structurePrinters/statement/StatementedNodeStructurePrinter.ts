import CodeBlockWriter from "code-block-writer";
import {StatementedNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ClassDeclarationStructurePrinter} from "../class";
import {InterfaceDeclarationStructurePrinter} from "../interface";
import {EnumDeclarationStructurePrinter} from "../enum";
import {FunctionDeclarationStructurePrinter} from "../function";
import {NamespaceDeclarationStructurePrinter} from "../namespace";
import {TypeAliasDeclarationStructurePrinter} from "../types";

export class StatementedNodeStructurePrinter extends StructurePrinter<StatementedNodeStructure> {
    private readonly classWriter = new ClassDeclarationStructurePrinter(this.writer, this.options);
    private readonly interfaceWriter = new InterfaceDeclarationStructurePrinter(this.writer);
    private readonly enumWriter = new EnumDeclarationStructurePrinter(this.writer);
    private readonly functionWriter = new FunctionDeclarationStructurePrinter(this.writer);
    private readonly namespaceWriter = new NamespaceDeclarationStructurePrinter(this.writer, this.options);
    private readonly typeAliasWriter = new TypeAliasDeclarationStructurePrinter(this.writer);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    printText(structure: StatementedNodeStructure) {
        conditionalBlankLine(this.writer, structure.typeAliases);
        this.typeAliasWriter.printTexts(structure.typeAliases);

        conditionalBlankLine(this.writer, structure.interfaces);
        this.interfaceWriter.printTexts(structure.interfaces);

        conditionalBlankLine(this.writer, structure.enums);
        this.enumWriter.printTexts(structure.enums);

        conditionalBlankLine(this.writer, structure.functions);
        this.functionWriter.printTexts(structure.functions);

        conditionalBlankLine(this.writer, structure.classes);
        this.classWriter.printTexts(structure.classes);

        conditionalBlankLine(this.writer, structure.namespaces);
        this.namespaceWriter.printTexts(structure.namespaces);

        function conditionalBlankLine(writer: CodeBlockWriter, structures: any[] | undefined) {
            if (!writer.isAtStartOfFirstLineOfBlock() && !ArrayUtils.isNullOrEmpty(structures))
                writer.blankLine();
        }
    }
}
