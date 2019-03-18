import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { ClassDeclarationStructurePrinter } from "../../../structurePrinters";
import { ClassDeclarationStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(ClassDeclarationStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
        isAmbient?: boolean;
    }

    function doTest(structure: OptionalKind<ClassDeclarationStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forClassDeclaration({ isAmbient: options.isAmbient || false }).printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests

    describe(nameof<ClassDeclarationStructurePrinter>(p => p.printText), () => {
        describe("implements", () => {
            it("should write implements", () => {
                doTest({ name: "C", implements: ["Base1", writer => writer.write("Base2")] },
                    `class C implements Base1, Base2 {\n}`);
            });

            it("should write with a writer with queued child indentation", () => {
                doTest({ name: "C", implements: writer => writer.writeLine("Base1,").write("Base2") },
                    `class C implements Base1,\n    Base2 {\n}`);
            });

            it("should not write if empty", () => {
                doTest({ name: "C", implements: _ => {} },
                    `class C {\n}`);
            });
        });

        describe("extends", () => {
            it("should write with string", () => {
                doTest({ name: "C", extends: "Base" },
                    `class C extends Base {\n}`);
            });

            it("should write with writer and queued child indentation", () => {
                doTest({ name: "C", extends: writer => writer.writeLine("string |").write("number") },
                    `class C extends string |\n    number {\n}`);
            });

            it("should not write if empty", () => {
                doTest({ name: "C", extends: _ => {} },
                    `class C {\n}`);
            });
        });
    });
});
