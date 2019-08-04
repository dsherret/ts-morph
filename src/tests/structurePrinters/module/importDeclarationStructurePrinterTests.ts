import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { ExportDeclarationStructurePrinter } from "../../../structurePrinters";
import { ExportDeclarationStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(ExportDeclarationStructurePrinter), () => {
    function doTest(structure: OptionalKind<ExportDeclarationStructure>, expectedOutput: string, formatCodeSettings?: FormatCodeSettings) {
        const { writer, factory } = getStructureFactoryAndWriter(formatCodeSettings);
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
