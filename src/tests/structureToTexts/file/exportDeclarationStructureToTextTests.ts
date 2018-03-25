import {expect} from "chai";
import CodeBlockWriter from "code-block-writer";
import {ImportDeclarationStructureToText} from "../../../structureToTexts";
import {ImportDeclarationStructure} from "../../../structures";
import {FormatCodeSettings} from "../../../compiler";
import {getDefaultFormatCodeSettings} from "../../testHelpers";

describe(nameof(ImportDeclarationStructureToText), () => {
    function doTest(structure: ImportDeclarationStructure, expectedOutput: string, formatCodeSettings?: FormatCodeSettings) {
        const writer = new CodeBlockWriter();
        new ImportDeclarationStructureToText(writer, getDefaultFormatCodeSettings(formatCodeSettings)).writeText(structure);
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
