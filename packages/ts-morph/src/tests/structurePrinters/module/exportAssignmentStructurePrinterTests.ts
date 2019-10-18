import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { ExportAssignmentStructurePrinter } from "../../../structurePrinters";
import { ExportAssignmentStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(ExportAssignmentStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: OptionalKind<ExportAssignmentStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forExportAssignment().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests

    describe(nameof<ExportAssignmentStructurePrinter>(p => p.printText), () => {
        describe("expression", () => {
            it("should write with a string", () => {
                doTest({ expression: "testing" }, `export = testing;`);
            });

            it("should write with a writer and use queued child indentation", () => {
                doTest({ expression: writer => writer.writeLine("testing |").write("this") }, `export = testing |\n    this;`);
            });
        });
    });
});
