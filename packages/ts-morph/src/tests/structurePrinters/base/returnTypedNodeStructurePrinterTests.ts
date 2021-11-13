import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { ReturnTypedNodeStructurePrinter } from "../../../structurePrinters";
import { ReturnTypedNodeStructure } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";
import { nameof } from "@ts-morph/common";

describe("ReturnTypedNodeStructurePrinter", () => {
    interface Options {
        alwaysWrite?: boolean;
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: MakeRequired<ReturnTypedNodeStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forReturnTypedNode(options.alwaysWrite).printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    describe(nameof.property<ReturnTypedNodeStructurePrinter>("printText"), () => {
        it("should not write when undefined", () => {
            doTest({ returnType: undefined }, ``);
        });

        it("should write when providing a string", () => {
            doTest({ returnType: "string" }, `: string`);
        });

        it("should write when specifying to always write", () => {
            doTest({ returnType: undefined }, `: void`, { alwaysWrite: true });
        });

        it("should write when providing a writer", () => {
            doTest({ returnType: writer => writer.write("string") }, `: string`);
        });

        it("should on multiple lines with child indentation", () => {
            doTest({ returnType: writer => writer.writeLine("string |").write("number") }, `: string |\n    number`);
        });
    });
});
