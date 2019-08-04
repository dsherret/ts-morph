import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { InitializerExpressionableNodeStructurePrinter } from "../../../structurePrinters";
import { InitializerExpressionableNodeStructure } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(InitializerExpressionableNodeStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: MakeRequired<InitializerExpressionableNodeStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forInitializerExpressionableNode().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    describe(nameof<InitializerExpressionableNodeStructurePrinter>(p => p.printText), () => {
        it("should not write when undefined", () => {
            doTest({ initializer: undefined }, ``);
        });

        it("should write when string", () => {
            doTest({ initializer: "string" }, ` = string`);
        });

        it("should write when writer", () => {
            doTest({ initializer: writer => writer.write("string") }, ` = string`);
        });

        it("should with indentation on multiple lines", () => {
            doTest(
                { initializer: writer => writer.writeLine("string |").write("number") },
                ` = string |\n    number`
            );
        });
    });
});
