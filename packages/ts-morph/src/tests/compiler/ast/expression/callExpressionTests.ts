import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CallExpression } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(CallExpression), () => {
    describe(nameof<CallExpression>(e => e.getReturnType), () => {
        function doTest(text: string, expectedTypes: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
            expect(callExpressions.map(c => c.getReturnType().getText())).to.deep.equal(expectedTypes);
        }

        it("should get the call expression's return type", () => {
            doTest("const func = () => ''; const myVar = func();", ["string"]);
        });

        it("should get the call expression's return type when void", () => {
            doTest("const func = () => {}; const myVar = func();", ["void"]);
        });

        it("should get the call expression's return type when chained", () => {
            doTest("const func = () => () => 4; const myVar = func()();", ["number", "() => number"]);
        });
    });
});
