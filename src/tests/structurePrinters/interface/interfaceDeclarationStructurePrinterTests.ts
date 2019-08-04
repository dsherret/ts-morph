import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { InterfaceDeclarationStructurePrinter } from "../../../structurePrinters";
import { InterfaceDeclarationStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(InterfaceDeclarationStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: OptionalKind<InterfaceDeclarationStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forInterfaceDeclaration().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests

    describe(nameof<InterfaceDeclarationStructurePrinter>(p => p.printText), () => {
        describe("implements", () => {
            it("should write extends", () => {
                doTest({ name: "I", extends: ["Base1", writer => writer.write("Base2")] }, `interface I extends Base1, Base2 {\n}`);
            });

            it("should write with a writer with queued child indentation", () => {
                doTest({ name: "I", extends: writer => writer.writeLine("Base1,").write("Base2") }, `interface I extends Base1,\n    Base2 {\n}`);
            });

            it("should not write if empty", () => {
                doTest({ name: "I", extends: _ => {} }, `interface I {\n}`);
            });
        });
    });
});
