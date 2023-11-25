import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { ReturnTypedNodeStructure } from "../../structures";
import { Printer } from "../Printer";

export class ReturnTypedNodeStructurePrinter extends Printer<ReturnTypedNodeStructure> {
  readonly #alwaysWrite: boolean;

  constructor(alwaysWrite = false) {
    super();
    this.#alwaysWrite = alwaysWrite;
  }

  printText(writer: CodeBlockWriter, structure: ReturnTypedNodeStructure) {
    let { returnType } = structure;
    if (returnType == null && this.#alwaysWrite === false)
      return;

    returnType = returnType ?? "void";

    const returnTypeText = this.getText(writer, returnType);
    if (!StringUtils.isNullOrWhitespace(returnTypeText)) {
      writer.hangingIndent(() => {
        writer.write(`: ${returnTypeText}`);
      });
    }
  }
}
