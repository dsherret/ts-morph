import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { ImportDeclarationStructurePrinter } from "../../../structurePrinters";
import { ImportDeclarationStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(ImportDeclarationStructurePrinter), () => {
    function doTest(structure: OptionalKind<ImportDeclarationStructure>, expectedOutput: string, formatCodeSettings?: FormatCodeSettings) {
        const { writer, factory } = getStructureFactoryAndWriter(formatCodeSettings);
        factory.forImportDeclaration().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests in the future

    describe("insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", () => {
        it("should write named imports with surrounding spaces by default", () => {
            doTest({ namedImports: ["test"], moduleSpecifier: "test" }, `import { test } from "test";`);
        });

        it("should not write named imports with surrounding spaces when providing setting as false", () => {
            doTest(
                { namedImports: ["test"], moduleSpecifier: "test" },
                `import {test} from "test";`,
                { insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false }
            );
        });
    });
});
