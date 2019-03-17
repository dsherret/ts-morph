import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { StatementedNodeStructure } from "../../structures";
import { ArrayUtils } from "../../utils";
import { Printer } from "../Printer";

export class StatementedNodeStructurePrinter extends Printer<StatementedNodeStructure> {
    constructor(private readonly factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: StatementedNodeStructure) {
        conditionalBlankLine(structure.typeAliases);
        this.factory.forTypeAliasDeclaration().printTexts(writer, structure.typeAliases);

        conditionalBlankLine(structure.interfaces);
        this.factory.forInterfaceDeclaration().printTexts(writer, structure.interfaces);

        conditionalBlankLine(structure.enums);
        this.factory.forEnumDeclaration().printTexts(writer, structure.enums);

        conditionalBlankLine(structure.functions);
        this.factory.forFunctionDeclaration({ isAmbient: this.options.isAmbient }).printTexts(writer, structure.functions);

        conditionalBlankLine(structure.classes);
        this.factory.forClassDeclaration(this.options).printTexts(writer, structure.classes);

        conditionalBlankLine(structure.namespaces);
        this.factory.forNamespaceDeclaration(this.options).printTexts(writer, structure.namespaces);

        this.factory.forStatements(this.options).printTexts(writer, structure.statements);

        function conditionalBlankLine(structures: ReadonlyArray<any> | undefined) {
            if (!writer.isAtStartOfFirstLineOfBlock() && !ArrayUtils.isNullOrEmpty(structures))
                writer.blankLine();
        }
    }
}
