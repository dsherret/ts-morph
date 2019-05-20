import { CodeBlockWriter } from "../../codeBlockWriter";
import * as errors from "../../errors";
import { StructurePrinterFactory } from "../../factories";
import { ClassMemberStructures, StructureKind } from "../../structures";
import { WriterFunction } from "../../types";
import { isLastNonWhitespaceCharCloseBrace } from "../helpers";
import { Printer } from "../Printer";

export type ClassMemberStructuresArrayItem = string | WriterFunction | ClassMemberStructures;

export class ClassMemberStructurePrinter extends Printer<ClassMemberStructuresArrayItem> {
    constructor(private readonly factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printTexts(writer: CodeBlockWriter, members: ReadonlyArray<ClassMemberStructuresArrayItem> | string | WriterFunction | undefined) {
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

    printText(writer: CodeBlockWriter, members: ClassMemberStructuresArrayItem) {
        if (typeof members === "string" || members instanceof Function || members == null) {
            this.printTextOrWriterFunc(writer, members);
            return;
        }

        switch (members.kind) {
            case StructureKind.Method:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forMethodDeclaration(this.options).printText(writer, members);
                break;
            case StructureKind.Property:
                this.factory.forPropertyDeclaration().printText(writer, members);
                break;
            case StructureKind.GetAccessor:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forGetAccessorDeclaration(this.options).printText(writer, members);
                break;
            case StructureKind.SetAccessor:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forSetAccessorDeclaration(this.options).printText(writer, members);
                break;
            case StructureKind.Constructor:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forConstructorDeclaration(this.options).printText(writer, members);
                break;
            default:
                errors.throwNotImplementedForNeverValueError(members);
        }

        function ensureBlankLine() {
            if (!writer.isAtStartOfFirstLineOfBlock())
                writer.blankLineIfLastNot();
        }
    }
}
