import { expect } from "chai";
import { CodeBlockWriter } from "../../../codeBlockWriter";
import { FormatCodeSettings } from "../../../compiler";
import { StructurePrinterFactory } from "../../../factories";
import { ExportDeclarationStructurePrinter } from "../../../structurePrinters";
import { ExportDeclarationStructure } from "../../../structures";
import { getDefaultFormatCodeSettings } from "../../testHelpers";

describe(nameof(ExportDeclarationStructurePrinter), () => {
    function doTest(structure: ExportDeclarationStructure, expectedOutput: string, formatCodeSettings?: FormatCodeSettings) {
        const writer = new CodeBlockWriter();
        const factory = new StructurePrinterFactory(() => getDefaultFormatCodeSettings(formatCodeSettings));
        factory.forExportDeclaration().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests in the future

    describe("insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", () => {
        it("should write named exports with surrounding spaces by default", () => {
            doTest({ namedExports: ["test"] }, "export { test };");
        });

        it("should not write named exports with surrounding spaces when providing setting as false", () => {
            doTest({ namedExports: ["test"] }, "export {test};", { insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
        });

        it("should write empty named exports with surrounding spaces by default", () => {
            doTest({}, "export { };");
        });

        it("should not write empty named exports with surrounding spaces by when providing setting as false", () => {
            doTest({}, "export {};", { insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
        });
    });
});
