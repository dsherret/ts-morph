import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { EnumMemberStructure, OptionalKind } from "../../structures";
import { WriterFunction } from "../../types";
import { isValidVariableName } from "../../utils";
import { CommaNewLineSeparatedStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class EnumMemberStructurePrinter extends NodePrinter<OptionalKind<EnumMemberStructure> | WriterFunction | string> {
    private readonly multipleWriter = new CommaNewLineSeparatedStructuresPrinter(this);

    printTexts(
        writer: CodeBlockWriter,
        structures: ReadonlyArray<OptionalKind<EnumMemberStructure> | WriterFunction | string> | WriterFunction | string | undefined,
    ) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<EnumMemberStructure> | WriterFunction | string) {
        if (structure instanceof Function) {
            structure(writer);
            return;
        }
        else if (typeof structure === "string") {
            writer.write(structure);
            return;
        }

        this.factory.forJSDoc().printDocs(writer, structure.docs);
        // Adds quotes if structure is not a valid variable name
        // AND the string is not enclosed in quotation marks
        if (isValidVariableName(structure.name) || StringUtils.isQuoted(structure.name))
            writer.write(structure.name);
        else
            writer.quote(structure.name);

        if (typeof structure.value === "string") {
            const { value } = structure;
            writer.hangingIndent(() => writer.write(` = `).quote(value));
        }
        else if (typeof structure.value === "number")
            writer.write(` = ${structure.value}`);
        else
            this.factory.forInitializerExpressionableNode().printText(writer, structure);
    }
}
