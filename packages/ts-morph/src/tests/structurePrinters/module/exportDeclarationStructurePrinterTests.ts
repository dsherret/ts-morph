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

    function doThrowTest(structure: OptionalKind<ExportDeclarationStructure>, expectedMessage: string, formatCodeSettings?: FormatCodeSettings) {
        const { writer, factory } = getStructureFactoryAndWriter(formatCodeSettings);
        expect(() => factory.forExportDeclaration().printText(writer, structure)).to.throw(expectedMessage);
    }

    // todo: more tests in the future

    describe("type only", () => {
        it("should write a type only export", () => {
            doTest({ isTypeOnly: true, namedExports: ["test"] }, "export type { test };");
        });
    });

    describe("namespace export", () => {
        it("should write a namespace export", () => {
            doTest({ namespaceExport: "ns", moduleSpecifier: "test" }, `export * as ns from "test";`);
        });

        it("should write an asterisk when empty", () => {
            doTest({ namespaceExport: "", moduleSpecifier: "test" }, `export * from "test";`);
        });

        it("should throw when specifying a namespace export and named exports", () => {
            doThrowTest(
                { namespaceExport: "ns", namedExports: ["test"], moduleSpecifier: "test" },
                "An export declaration cannot have both a namespace export and a named export",
            );
        });
    });

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
