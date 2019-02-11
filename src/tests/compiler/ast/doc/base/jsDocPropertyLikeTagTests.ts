import { expect } from "chai";
import { JSDocPropertyLikeTag, Type } from "../../../../../compiler";
import { TypeGuards } from "../../../../../utils";
import { getInfoFromText } from "../../../testHelpers";

describe(nameof(JSDocPropertyLikeTag), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(TypeGuards.isJSDocPropertyLikeTag), ...info };
    }

    describe(nameof<JSDocPropertyLikeTag>(d => d.getTypeExpressionNode), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getTypeExpressionNode()!.getTypeNode().getText()).to.equal(expected);
        }

        it("should get when type is given", () => {
            doTest("/** @param {boolean} t - String */\nfunction test() {}", "boolean");
        });
    });

    describe(nameof<JSDocPropertyLikeTag>(d => d.getName), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getName()).to.equal(expected);
        }

        it("should get when identifier", () => {
            doTest("/** @param {boolean} t - String */\nfunction test() {}", "t");
        });

        it("should get when fully qualified name", () => {
            doTest("/** @param {boolean} t.t.t - String */\nfunction test() {}", "t.t.t");
        });
    });

    describe(nameof<JSDocPropertyLikeTag>(d => d.getNameNode), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getNameNode().getText()).to.equal(expected);
        }

        it("should get when identifier", () => {
            doTest("/** @param {boolean} t - String */\nfunction test() {}", "t");
        });

        it("should get when fully qualified name", () => {
            doTest("/** @param {boolean} t.t.t - String */\nfunction test() {}", "t.t.t");
        });
    });
});
