import { CodeBlockWriter } from "../../codeBlockWriter";
import { errors } from "@ts-morph/common";
import { StructurePrinterFactory } from "../../factories";
import { StatementStructures, StructureKind } from "../../structures";
import { WriterFunction } from "../../types";
import { isLastNonWhitespaceCharCloseBrace } from "../helpers";
import { Printer } from "../Printer";

export type StatementStructuresArrayItem = string | WriterFunction | StatementStructures;

export class StatementStructurePrinter extends Printer<StatementStructuresArrayItem> {
    constructor(private readonly factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printTexts(writer: CodeBlockWriter, statements: ReadonlyArray<StatementStructuresArrayItem> | string | WriterFunction | undefined) {
        if (statements == null)
            return;

        if (typeof statements === "string" || statements instanceof Function)
            this.printText(writer, statements);
        else {
            for (const statement of statements) {
                if (isLastNonWhitespaceCharCloseBrace(writer))
                    writer.blankLineIfLastNot();
                else if (!writer.isAtStartOfFirstLineOfBlock())
                    writer.newLineIfLastNot();

                this.printText(writer, statement);
            }
        }
    }

    printText(writer: CodeBlockWriter, statement: StatementStructuresArrayItem) {
        if (typeof statement === "string" || statement instanceof Function || statement == null) {
            this.printTextOrWriterFunc(writer, statement);
            return;
        }

        switch (statement.kind) {
            case StructureKind.Function:
                if (!this.options.isAmbient)
                    ensureBlankLine();
                this.factory.forFunctionDeclaration(this.options).printText(writer, statement);
                break;
            case StructureKind.Class:
                ensureBlankLine();
                this.factory.forClassDeclaration(this.options).printText(writer, statement);
                break;
            case StructureKind.Interface:
                ensureBlankLine();
                this.factory.forInterfaceDeclaration().printText(writer, statement);
                break;
            case StructureKind.TypeAlias:
                this.factory.forTypeAliasDeclaration().printText(writer, statement);
                break;
            case StructureKind.VariableStatement:
                this.factory.forVariableStatement().printText(writer, statement);
                break;
            case StructureKind.ImportDeclaration:
                this.factory.forImportDeclaration().printText(writer, statement);
                break;
            case StructureKind.Namespace:
                ensureBlankLine();
                this.factory.forNamespaceDeclaration(this.options).printText(writer, statement);
                break;
            case StructureKind.Enum:
                ensureBlankLine();
                this.factory.forEnumDeclaration().printText(writer, statement);
                break;
            case StructureKind.ExportDeclaration:
                this.factory.forExportDeclaration().printText(writer, statement);
                break;
            case StructureKind.ExportAssignment:
                this.factory.forExportAssignment().printText(writer, statement);
                break;
            default:
                errors.throwNotImplementedForNeverValueError(statement);
        }

        function ensureBlankLine() {
            if (!writer.isAtStartOfFirstLineOfBlock())
                writer.blankLineIfLastNot();
        }
    }
}
