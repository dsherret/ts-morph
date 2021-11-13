import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { DecoratorStructurePrinter } from "../../../structurePrinters";
import { DecoratorStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";
import { nameof } from "@ts-morph/common";

describe("DecoratorStructurePrinter", () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: OptionalKind<DecoratorStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forDecorator().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests

    describe(nameof.property<DecoratorStructurePrinter>("printText"), () => {
        describe("arguments", () => {
            it("should write", () => {
                doTest({ name: "dec", arguments: ["1", writer => writer.write("2")] }, `@dec(1, 2)`);
            });

            it("should write with a writer with queued child indentation", () => {
                doTest({ name: "dec", arguments: writer => writer.writeLine("1,").write("2") }, `@dec(1,\n    2)`);
            });
        });

        describe("type arguments", () => {
            it("should not write when empty", () => {
                doTest({ name: "dec", typeArguments: [] }, `@dec`);
            });

            it("should write", () => {
                doTest({ name: "dec", typeArguments: ["string"], arguments: ["1"] }, `@dec<string>(1)`);
            });

            it("should write multiple", () => {
                doTest({ name: "dec", typeArguments: ["string", "number"] }, `@dec<string, number>`);
            });
        });
    });
});
