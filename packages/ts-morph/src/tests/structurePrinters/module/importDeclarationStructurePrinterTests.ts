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

    function doThrowTest(structure: OptionalKind<ImportDeclarationStructure>, expectedMessage: string, formatCodeSettings?: FormatCodeSettings) {
        const { writer, factory } = getStructureFactoryAndWriter(formatCodeSettings);
        expect(() => factory.forImportDeclaration().printText(writer, structure)).to.throw(expectedMessage);
    }

    // todo: more tests in the future

    describe("type only imports", () => {
        it("should write a type only import", () => {
            doTest({ isTypeOnly: true, namedImports: ["test"], moduleSpecifier: "test" }, `import type { test } from "test";`);
        });
    });

    describe("namespace import", () => {
        it("should throw when specifying a namespace import and a named import", () => {
            doThrowTest(
                { namespaceImport: "t", namedImports: ["test"], moduleSpecifier: "test" },
                "An import declaration cannot have both a namespace import and a named import."
            );
        });
    })

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
