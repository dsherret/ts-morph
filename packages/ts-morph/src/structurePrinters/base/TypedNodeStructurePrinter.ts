import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypedNodeStructure } from "../../structures";
import { Printer } from "../Printer";

export class TypedNodeStructurePrinter extends Printer<TypedNodeStructure> {
    constructor(private readonly separator: string, private readonly alwaysWrite = false) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: TypedNodeStructure) {
        let { type } = structure;
        if (type == null && this.alwaysWrite === false)
            return;

        type = type ?? "any";

        const typeText = this.getText(writer, type);
        if (!StringUtils.isNullOrWhitespace(typeText)) {
            writer.hangingIndent(() => {
                writer.write(`${this.separator} ${typeText}`);
            });
        }
    }
}
