import { expect } from "chai";
import { ReturnStatement } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ReturnStatement), () => {
    describe(nameof<ReturnStatement>(d => d.getExpressionOrThrow), () => {
        it("should get the expression when it exists", () => {
            const { firstChild } = getInfoFromText<ReturnStatement>("return t;");
            expect(firstChild.getExpressionOrThrow().getText()).to.equal("t");
        });

        it("should return throw when it doesn't exist", () => {
            const { firstChild } = getInfoFromText<ReturnStatement>("return;");
            expect(() => firstChild.getExpressionOrThrow()).to.throw();
        });
    });

    describe(nameof<ReturnStatement>(d => d.getExpression), () => {
        it("should get the expression when it exists", () => {
            const { firstChild } = getInfoFromText<ReturnStatement>("return t;");
            expect(firstChild.getText()).to.equal("return t;");
            expect(firstChild.getExpression()!.getText()).to.equal("t");
        });

        it("should return undefined when it doesn't exist", () => {
            const { firstChild } = getInfoFromText<ReturnStatement>("return;");
            expect(firstChild.getExpression()).to.be.undefined;
        });
    });

    describe(nameof<ReturnStatement>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            (sourceFile.getChildSyntaxListOrThrow().getChildren()[index] as ReturnStatement).remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the expression statement", () => {
            doTest("return 1;\nreturn 2;\nreturn 3;", 1, "return 1;\nreturn 3;");
        });
    });
});
