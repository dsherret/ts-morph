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
    private readonly blankLineWriter = new BlankLineFormattingStructuresPrinter(this.writer, this);
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly decoratorWriter = new DecoratorStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly parameterWriter = new ParameterDeclarationStructurePrinter(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly bodyWriter = new BodyTextStructurePrinter(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    printTexts(structures: SetAccessorDeclarationStructure[] | undefined) {
        this.blankLineWriter.printText(structures);
    }

    printText(structure: SetAccessorDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.decoratorWriter.printTexts(structure.decorators);
        this.modifierWriter.printText(structure);
        this.writer.write(`set ${structure.name}`);
        this.typeParameterWriter.printTexts(structure.typeParameters);
        this.writer.write("(");
        this.parameterWriter.printTexts(structure.parameters);
        this.writer.write(")");
        this.writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.returnType), `: ${structure.returnType}`);
        this.writer.spaceIfLastNot().inlineBlock(() => {
            this.bodyWriter.printText(structure);
        });
    }
}
