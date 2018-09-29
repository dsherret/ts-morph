import { expect } from "chai";
import { CodeBlockWriter } from "../../../codeBlockWriter";
import { FormatCodeSettings } from "../../../compiler";
import { StructurePrinterFactory } from "../../../factories";
import { ImportDeclarationStructurePrinter } from "../../../structurePrinters";
import { ImportDeclarationStructure } from "../../../structures";
import { getDefaultFormatCodeSettings } from "../../testHelpers";

describe(nameof(ImportDeclarationStructurePrinter), () => {
    function doTest(structure: ImportDeclarationStructure, expectedOutput: string, formatCodeSettings?: FormatCodeSettings) {
        const writer = new CodeBlockWriter();
        const factory = new StructurePrinterFactory(() => getDefaultFormatCodeSettings(formatCodeSettings));
        factory.forImportDeclaration().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests in the future

    describe("insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", () => {
        it("should write named imports with surrounding spaces by default", () => {
            doTest({ namedImports: ["test"], moduleSpecifier: "test" }, `import { test } from "test";`);
        });

        it("should not write named imports with surrounding spaces when providing setting as false", () => {
            doTest({ namedImports: ["test"], moduleSpecifier: "test" }, `import {test} from "test";`, { insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
        });
    });
});
