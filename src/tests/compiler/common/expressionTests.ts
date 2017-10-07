import * as ts from "typescript";
import {expect} from "chai";
import {Expression, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Expression), () => {
    // todo: this remove should be moved to be on decorators
    describe(nameof<Expression>(e => e.remove), () => {
        describe("decorators", () => {
            function doTest(text: string, removeIndex: number, expectedText: string) {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(text);
                firstChild.getDecorators()[0].getArguments()[removeIndex].remove();
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove a decorator argument at the start", () => {
                doTest("@test(1, 2, 3)\nclass T {}", 0, "@test(2, 3)\nclass T {}");
            });

            it("should remove a decorator argument in the middle", () => {
                doTest("@test(1, 2, 3)\nclass T {}", 1, "@test(1, 3)\nclass T {}");
            });

            it("should remove a decorator argument at the end", () => {
                doTest("@test(1, 2, 3)\nclass T {}", 2, "@test(1, 2)\nclass T {}");
            });
        });
    });
});
