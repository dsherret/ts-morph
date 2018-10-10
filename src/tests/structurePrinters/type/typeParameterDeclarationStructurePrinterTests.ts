import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { TypeParameterDeclarationStructurePrinter } from "../../../structurePrinters";
import { TypeParameterDeclarationStructure } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(TypeParameterDeclarationStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: TypeParameterDeclarationStructure, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forTypeParameterDeclaration().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests

    describe(nameof<TypeParameterDeclarationStructurePrinter>(p => p.printText), () => {
        describe("constraint", () => {
            it("should write with string", () => {
                doTest({ name: "T", constraint: "string" }, `T extends string`);
            });

            it("should write with writer", () => {
                doTest({ name: "T", constraint: writer => writer.write("string") }, `T extends string`);
            });

            it("should write on multiple lines with queued child indentation", () => {
                doTest({ name: "T", constraint: writer => writer.writeLine("string |").write("number") }, `T extends string |\n    number`);
            });

            it("should not write if whitespace", () => {
                doTest({ name: "T", constraint: " \n" }, `T`);
            });
        });

        describe("default", () => {
            it("should write with string", () => {
                doTest({ name: "T", default: "string" }, `T = string`);
            });

            it("should write with writer", () => {
                doTest({ name: "T", default: writer => writer.write("string") }, `T = string`);
            });

            it("should write on multiple lines with queued child indentation", () => {
                doTest({ name: "T", default: writer => writer.writeLine("string |").write("number") }, `T = string |\n    number`);
            });

            it("should not write if whitespace", () => {
                doTest({ name: "T", default: " \n" }, `T`);
            });
        });
    });
});
