import { expect } from "chai";
import { ExpressionStatement } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ExpressionStatement), () => {
    describe(nameof<ExpressionStatement>(d => d.getExpression), () => {
        it("should get the expression", () => {
            const { firstChild } = getInfoFromText<ExpressionStatement>("hello();");
            expect(firstChild.getText()).to.equal("hello();");
            expect(firstChild.getExpression().getText()).to.equal("hello()");
        });
    });

    describe(nameof<ExpressionStatement>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            (sourceFile.getChildSyntaxListOrThrow().getChildren()[index] as ExpressionStatement).remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the expression statement", () => {
            doTest("hello();\nthere();\ntest();", 1, "hello();\ntest();");
        });
    });
});
