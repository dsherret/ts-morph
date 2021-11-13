import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JSDocTemplateTag } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("JSDocTemplateTag", () => {
    function getInfo(text: string) {
        return getInfoFromTextWithDescendant<JSDocTemplateTag>(text, SyntaxKind.JSDocTemplateTag);
    }

    describe(nameof<JSDocTemplateTag>("getTypeParameters"), () => {
        function doTest(text: string, expected: string[]) {
            const { descendant } = getInfo(text);
            expect(descendant.getTypeParameters().map(p => p.getText())).to.deep.equal(expected);
        }

        it("should get when it exists", () => {
            doTest("/**\n * @template T, U\n */\nlet x;", ["T", "U"]);
        });

        it("should be empty when not exists", () => {
            // opened https://github.com/microsoft/TypeScript/issues/36692
            doTest("/**\n * @template\n */\nlet x;", []);
        });
    });

    describe(nameof<JSDocTemplateTag>("getConstraint"), () => {
        function doTest(text: string, expectedValue: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getConstraint()?.getText()).to.equal(expectedValue);
            if (expectedValue == null)
                expect(() => descendant.getConstraintOrThrow()).to.throw();
            else
                expect(descendant.getConstraintOrThrow().getText()).to.equal(expectedValue);
        }

        it("should get when exists", () => {
            doTest("/**\n * @template {string} T\n */\nlet x;", "{string}");
        });

        it("should get when not exists", () => {
            doTest("/**\n * @template T\n */\nlet x;", undefined);
        });
    });
});
