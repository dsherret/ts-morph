﻿import { CodeBlockWriter } from "../../codeBlockWriter";
import { ReturnTypedNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { Printer } from "../Printer";

export class ReturnTypedNodeStructurePrinter extends Printer<ReturnTypedNodeStructure> {
    constructor(private readonly alwaysWrite = false) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: ReturnTypedNodeStructure) {
        let { returnType } = structure;
        if (returnType == null && this.alwaysWrite === false)
            return;

        returnType = returnType || "void";

        const returnTypeText = this.getText(writer, returnType);
        if (!StringUtils.isNullOrWhitespace(returnTypeText)) {
            writer.withHangingIndentation(() => {
                writer.write(`: ${returnTypeText}`);
            });
        }
    }
}
