import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { TypedNodeStructurePrinter } from "../../../structurePrinters";
import { TypedNodeStructure } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(TypedNodeStructurePrinter), () => {
    interface Options {
        alwaysWrite?: boolean;
        formatCodeSettings?: FormatCodeSettings;
        separator?: string;
    }

    function doTest(structure: MakeRequired<TypedNodeStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forTypedNode(options.separator || ":", options.alwaysWrite).printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    describe(nameof<TypedNodeStructurePrinter>(p => p.printText), () => {
        it("should not write when undefined", () => {
            doTest({ type: undefined }, ``);
        });

        it("should write when providing a string", () => {
            doTest({ type: "string" }, `: string`);
        });

        it("should write when specifying to always write", () => {
            doTest({ type: undefined }, `: any`, { alwaysWrite: true });
        });

        it("should write with provided separator", () => {
            doTest({ type: "string" }, `= string`, { separator: "=" });
        });

        it("should write when providing a writer", () => {
            doTest({ type: writer => writer.write("string") }, `: string`);
        });

        it("should on multiple lines with child indentation", () => {
            doTest({ type: writer => writer.writeLine("string |").write("number") }, `: string |\n    number`);
        });
    });
});
