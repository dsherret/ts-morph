import CodeBlockWriter from "code-block-writer";
import {SetAccessorDeclarationStructure} from "../../structures";
import {StringUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {JSDocStructurePrinter} from "../doc";
import {DecoratorStructurePrinter} from "../decorator";
import {BodyTextStructurePrinter} from "../statement";
import {ParameterDeclarationStructurePrinter} from "../function";
import {TypeParameterDeclarationStructurePrinter} from "../types";

export class SetAccessorDeclarationStructurePrinter extends StructurePrinter<SetAccessorDeclarationStructure> {
    private readonly blankLineWriter = new BlankLineFormattingStructuresPrinter(this);
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly decoratorWriter = new DecoratorStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly parameterWriter = new ParameterDeclarationStructurePrinter();
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly bodyWriter = new BodyTextStructurePrinter(this.options);

    constructor(private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printTexts(writer: CodeBlockWriter, structures: SetAccessorDeclarationStructure[] | undefined) {
        this.blankLineWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: SetAccessorDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.decoratorWriter.printTexts(writer, structure.decorators);
        this.modifierWriter.printText(writer, structure);
        writer.write(`set ${structure.name}`);
        this.typeParameterWriter.printTexts(writer, structure.typeParameters);
        writer.write("(");
        this.parameterWriter.printTexts(writer, structure.parameters);
        writer.write(")");
        writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.returnType), `: ${structure.returnType}`);
        writer.spaceIfLastNot().inlineBlock(() => {
            this.bodyWriter.printText(writer, structure);
        });
    }
}
