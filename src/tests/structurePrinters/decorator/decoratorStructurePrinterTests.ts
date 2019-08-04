import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { DecoratorStructurePrinter } from "../../../structurePrinters";
import { DecoratorStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(DecoratorStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: OptionalKind<DecoratorStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forDecorator().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests

    describe(nameof<DecoratorStructurePrinter>(p => p.printText), () => {
        describe("arguments", () => {
            it("should write", () => {
                doTest({ name: "dec", arguments: ["1", writer => writer.write("2")] }, `@dec(1, 2)`);
            });

            it("should write with a writer with queued child indentation", () => {
                doTest({ name: "dec", arguments: writer => writer.writeLine("1,").write("2") }, `@dec(1,\n    2)`);
            });
        });
    });
});
