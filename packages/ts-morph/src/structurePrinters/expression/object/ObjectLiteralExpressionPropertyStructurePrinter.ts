import { CodeBlockWriter } from "../../../codeBlockWriter";
import { errors } from "@ts-morph/common";
import { StructurePrinterFactory } from "../../../factories";
import { ObjectLiteralExpressionPropertyStructures, StructureKind } from "../../../structures";
import { WriterFunction } from "../../../types";
import { CommaNewLineSeparatedStructuresPrinter } from "../../formatting";
import { Printer } from "../../Printer";

export type ObjectLiteralExpressionStructuresArrayItem = string | WriterFunction | ObjectLiteralExpressionPropertyStructures;

export class ObjectLiteralExpressionPropertyStructurePrinter extends Printer<ObjectLiteralExpressionStructuresArrayItem> {
    private readonly multipleWriter = new CommaNewLineSeparatedStructuresPrinter(this);
    private readonly options = { isAmbient: false }; // always false for object literal expressions

    constructor(private readonly factory: StructurePrinterFactory) {
        super();
    }

    printTexts(writer: CodeBlockWriter, members: ReadonlyArray<ObjectLiteralExpressionStructuresArrayItem> | string | WriterFunction | undefined) {
        this.multipleWriter.printText(writer, members);
    }

    printText(writer: CodeBlockWriter, member: ObjectLiteralExpressionStructuresArrayItem) {
        if (typeof member === "string" || member instanceof Function || member == null) {
            this.printTextOrWriterFunc(writer, member);
            return;
        }

        switch (member.kind) {
            case StructureKind.PropertyAssignment:
                this.factory.forPropertyAssignment().printText(writer, member);
                break;
            case StructureKind.ShorthandPropertyAssignment:
                this.factory.forShorthandPropertyAssignment().printText(writer, member);
                break;
            case StructureKind.SpreadAssignment:
                this.factory.forSpreadAssignment().printText(writer, member);
                break;
            case StructureKind.Method:
                this.factory.forMethodDeclaration(this.options).printText(writer, member);
                break;
            case StructureKind.GetAccessor:
                this.factory.forGetAccessorDeclaration(this.options).printText(writer, member);
                break;
            case StructureKind.SetAccessor:
                this.factory.forSetAccessorDeclaration(this.options).printText(writer, member);
                break;
            default:
                errors.throwNotImplementedForNeverValueError(member);
        }
    }
}
