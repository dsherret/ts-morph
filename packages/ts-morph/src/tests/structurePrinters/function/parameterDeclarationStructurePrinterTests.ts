import { expect } from "chai";
import { ParameterDeclarationStructurePrinter } from "../../../structurePrinters";
import { ParameterDeclarationStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(ParameterDeclarationStructurePrinter), () => {
    describe(nameof<ParameterDeclarationStructurePrinter>(p => p.printTextsWithParenthesis), () => {
        function doTest(structures: OptionalKind<ParameterDeclarationStructure>[], expectedOutput: string) {
            const { writer, factory } = getStructureFactoryAndWriter();
            factory.forParameterDeclaration().printTextsWithParenthesis(writer, structures);
            expect(writer.toString()).to.equal(expectedOutput);
        }

        it("should print multiple on a single line", () => {
            doTest([{ name: "p" }, { name: "p1" }], "(p, p1)");
        });

        it("should handle when there are newlines in the type", () => {
            doTest(
                [{ name: "p", type: writer => writer.write("string").newLine().write("| number") }, { name: "p1" }],
                "(p: string\n    | number, p1)"
            );
        });
    });
});
