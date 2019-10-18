import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { TypeParameterDeclarationStructurePrinter } from "../../../structurePrinters";
import { TypeParameterDeclarationStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(TypeParameterDeclarationStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    // todo: more tests
    describe(nameof<TypeParameterDeclarationStructurePrinter>(p => p.printTextsWithBrackets), () => {
        function doTest(structures: (OptionalKind<TypeParameterDeclarationStructure> | string)[], expectedOutput: string, options: Options = {}) {
            const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
            factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structures);
            expect(writer.toString()).to.equal(expectedOutput);
        }

        it("should write the text with brackets and use a hanging indent", () => {
            doTest([{
                name: "MyName"
            }, {
                name: "MyNextName",
                constraint: writer => writer.write("{").newLine().indent().write("prop: string;").newLine().write("}")
            }], "<MyName, MyNextName extends {\n        prop: string;\n    }>");
        });
    });

    describe(nameof<TypeParameterDeclarationStructurePrinter>(p => p.printText), () => {
        function doTest(structure: OptionalKind<TypeParameterDeclarationStructure> | string, expectedOutput: string, options: Options = {}) {
            const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
            factory.forTypeParameterDeclaration().printText(writer, structure);
            expect(writer.toString()).to.equal(expectedOutput);
        }

        it("should write when a string", () => {
            doTest("T extends string", `T extends string`);
        });

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
