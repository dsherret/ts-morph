import { CodeBlockWriter } from "../../codeBlockWriter";
import * as errors from "../../errors";
import { StructurePrinterFactory } from "../../factories";
import { StatementStructures, StructureKind } from "../../structures";
import { WriterFunction } from "../../types";
import { Printer } from "../Printer";

// todo: make this the array instead?
export type StatementsStructure = { statements?: (string | WriterFunction | StatementStructures)[]; };

const isLastNonWhitespaceCharCloseBrace = /[}]\s*$/;

export class StatementsStructurePrinter extends Printer<StatementsStructure> {
    constructor(private readonly factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: StatementsStructure) {
        if (structure.statements == null)
            return;

        for (const statement of structure.statements) {
            if (isLastNonWhitespaceCharCloseBrace.test(writer.toString()))
                writer.blankLineIfLastNot();
            else if (!writer.isAtStartOfFirstLineOfBlock())
                writer.newLineIfLastNot();

            if (typeof statement === "string" || statement instanceof Function || statement == null) {
                this.printTextOrWriterFunc(writer, statement);
            }
            else {
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
                        throw errors.getNotImplementedForNeverValueError(statement);
                }
            }
        }

        function ensureBlankLine() {
            if (!writer.isAtStartOfFirstLineOfBlock())
                writer.blankLineIfLastNot();
        }
    }
}
