import { CodeBlockWriter } from "../../codeBlockWriter";
import { errors } from "@ts-morph/common";
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

    printText(writer: CodeBlockWriter, member: ClassMemberStructuresArrayItem) {
        if (typeof member === "string" || member instanceof Function || member == null) {
            this.printTextOrWriterFunc(writer, member);
            return;
        }

        switch (member.kind) {
            case StructureKind.Method:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forMethodDeclaration(this.options).printText(writer, member);
                break;
            case StructureKind.Property:
                this.factory.forPropertyDeclaration().printText(writer, member);
                break;
            case StructureKind.GetAccessor:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forGetAccessorDeclaration(this.options).printText(writer, member);
                break;
            case StructureKind.SetAccessor:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forSetAccessorDeclaration(this.options).printText(writer, member);
                break;
            case StructureKind.Constructor:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forConstructorDeclaration(this.options).printText(writer, member);
                break;
            default:
                errors.throwNotImplementedForNeverValueError(member);
        }

        function ensureBlankLine() {
            if (!writer.isAtStartOfFirstLineOfBlock())
                writer.blankLineIfLastNot();
        }
    }
}
