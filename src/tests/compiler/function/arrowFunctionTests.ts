import { expect } from "chai";
import { CodeBlockWriter } from "../../../codeBlockWriter";
import { ArrowFunction } from "../../../compiler";
import { StructurePrinterFactory } from "../../../factories";
import { ArrowFunctionStructurePrinter } from "../../../structurePrinters";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const info = getInfoFromTextWithDescendant<ArrowFunction>(text, SyntaxKind.ArrowFunction);
    return { ...info, expression: info.descendant };
}

describe(nameof(ArrowFunction), () => {
    describe(nameof<ArrowFunction>(n => n.getEqualsGreaterThan), () => {
        function doTest(text: string, expectedText: string) {
            const { expression } = getInfoFromTextWithExpression(text);
            expect(expression.getEqualsGreaterThan().getText()).to.equal(expectedText);
        }

        it("should get the correct equals greater than token", () => {
            doTest("(x) => {}", "=>");
        });
    });

    describe(nameof<ArrowFunction>(n => n.getStructure), () => {
        function doTest(text: string) {
            const { descendant, project } = getInfoFromTextWithDescendant<ArrowFunction>(text, SyntaxKind.ArrowFunction);
            const structure = descendant.getStructure();
            const writer = new CodeBlockWriter();
            const structurePrinter = new ArrowFunctionStructurePrinter(new StructurePrinterFactory(() => ({ insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true })));
            structurePrinter.printText(writer, structure);
            expect(writer.toString().replace(/\s+/gm, "")).equals(text.replace(/\s+/gm, ""));
        }

        it("should get correct structure for arrow function without braced body", () => {
            doTest("(x: number): number[] => [x * 2]");
        });

        it("should get correct structure for arrow function without braced body", () => {
            doTest("(x?: number): number[] => {return [x * 2]}");
        });
    });
});
