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
    private readonly classWriter = new ClassDeclarationStructurePrinter(this.options);
    private readonly interfaceWriter = new InterfaceDeclarationStructurePrinter();
    private readonly enumWriter = new EnumDeclarationStructurePrinter();
    private readonly functionWriter = new FunctionDeclarationStructurePrinter();
    private readonly namespaceWriter = new NamespaceDeclarationStructurePrinter(this.options);
    private readonly typeAliasWriter = new TypeAliasDeclarationStructurePrinter();

    constructor(private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: StatementedNodeStructure) {
        conditionalBlankLine(structure.typeAliases);
        this.typeAliasWriter.printTexts(writer, structure.typeAliases);

        conditionalBlankLine(structure.interfaces);
        this.interfaceWriter.printTexts(writer, structure.interfaces);

        conditionalBlankLine(structure.enums);
        this.enumWriter.printTexts(writer, structure.enums);

        conditionalBlankLine(structure.functions);
        this.functionWriter.printTexts(writer, structure.functions);

        conditionalBlankLine(structure.classes);
        this.classWriter.printTexts(writer, structure.classes);

        conditionalBlankLine(structure.namespaces);
        this.namespaceWriter.printTexts(writer, structure.namespaces);

        function conditionalBlankLine(structures: any[] | undefined) {
            if (!writer.isAtStartOfFirstLineOfBlock() && !ArrayUtils.isNullOrEmpty(structures))
                writer.blankLine();
        }
    }
}
