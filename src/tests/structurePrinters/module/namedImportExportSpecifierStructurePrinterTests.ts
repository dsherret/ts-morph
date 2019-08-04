import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { NamedImportExportSpecifierStructurePrinter } from "../../../structurePrinters";
import { ImportSpecifierStructure, ExportSpecifierStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(NamedImportExportSpecifierStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    // todo: more tests

    describe(nameof<NamedImportExportSpecifierStructurePrinter>(p => p.printText), () => {
        function doTest(
            structure: OptionalKind<ImportSpecifierStructure> | OptionalKind<ExportSpecifierStructure>,
            expectedOutput: string,
            options: Options = {}
        ) {
            const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
            factory.forNamedImportExportSpecifier().printText(writer, structure);
            expect(writer.toString()).to.equal(expectedOutput);
        }

        it("should write with alias", () => {
            doTest({ name: "test", alias: "alias" }, "test as alias");
        });

        it("should not write alias if it's empty", () => {
            doTest({ name: "test", alias: "" }, "test");
        });

        it("should not write alias if it's whitespace", () => {
            doTest({ name: "test", alias: "  \n" }, "test");
        });
    });

    describe(nameof<NamedImportExportSpecifierStructurePrinter>(p => p.printTextsWithBraces), () => {
        function doTest(
            structures: (OptionalKind<ImportSpecifierStructure> | OptionalKind<ExportSpecifierStructure>)[],
            expectedOutput: string,
            options: Options = {}
        ) {
            const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
            factory.forNamedImportExportSpecifier().printTextsWithBraces(writer, structures);
            expect(writer.toString()).to.equal(expectedOutput);
        }

        it("should write with queued child identation", () => {
            doTest([{ name: "test\n", alias: "test2" }], `{ test\n    as test2 }`);
        });
    });
});
