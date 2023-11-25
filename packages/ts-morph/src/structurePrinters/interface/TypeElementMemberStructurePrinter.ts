import { errors } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { StructureKind, TypeElementMemberStructures } from "../../structures";
import { WriterFunction } from "../../types";
import { isLastNonWhitespaceCharCloseBrace } from "../helpers";
import { Printer } from "../Printer";

export type TypeElementStructuresArrayItem = string | WriterFunction | TypeElementMemberStructures;

export class TypeElementMemberStructurePrinter extends Printer<TypeElementStructuresArrayItem> {
  readonly #factory: StructurePrinterFactory;

  constructor(factory: StructurePrinterFactory) {
    super();
    this.#factory = factory;
  }

  printTexts(writer: CodeBlockWriter, members: ReadonlyArray<TypeElementStructuresArrayItem> | string | WriterFunction | undefined) {
    if (members == null)
      return;

    if (typeof members === "string" || members instanceof Function)
      this.printText(writer, members);
    else {
      for (const member of members) {
        if (isLastNonWhitespaceCharCloseBrace(writer))
          writer.blankLineIfLastNot();
        else if (!writer.isAtStartOfFirstLineOfBlock())
          writer.newLineIfLastNot();

        this.printText(writer, member);
      }
    }
  }

  printText(writer: CodeBlockWriter, members: TypeElementStructuresArrayItem) {
    if (typeof members === "string" || members instanceof Function || members == null) {
      this.printTextOrWriterFunc(writer, members);
      return;
    }

    switch (members.kind) {
      case StructureKind.PropertySignature:
        this.#factory.forPropertySignature().printText(writer, members);
        break;
      case StructureKind.MethodSignature:
        this.#factory.forMethodSignature().printText(writer, members);
        break;
      case StructureKind.CallSignature:
        this.#factory.forCallSignatureDeclaration().printText(writer, members);
        break;
      case StructureKind.IndexSignature:
        this.#factory.forIndexSignatureDeclaration().printText(writer, members);
        break;
      case StructureKind.ConstructSignature:
        this.#factory.forConstructSignatureDeclaration().printText(writer, members);
        break;
      default:
        errors.throwNotImplementedForNeverValueError(members);
    }
  }
}
