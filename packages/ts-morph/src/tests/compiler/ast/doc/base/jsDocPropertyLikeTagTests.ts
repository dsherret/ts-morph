import { expect } from "chai";
import { JSDocPropertyLikeTag, Node } from "../../../../../compiler";
import { getInfoFromText } from "../../../testHelpers";

describe(nameof(JSDocPropertyLikeTag), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(Node.isJSDocPropertyLikeTag), ...info };
    }

    describe(nameof<JSDocPropertyLikeTag>(d => d.getTypeExpression), () => {
        it("should get undefined when there is no type given", () => {
            const { descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            expect(descendant.getTypeExpression()).to.be.undefined;
        });

        it("should get when type is given", () => {
            const { descendant } = getInfo("/** @param {boolean} t - String */\nfunction test() {}");
            expect(descendant.getTypeExpression()!.getTypeNode().getText()).to.equal("boolean");
        });
    });

    describe(nameof<JSDocPropertyLikeTag>(d => d.isBracketed), () => {
        function doTest(text: string, expected: boolean) {
            const { descendant } = getInfo(text);
            expect(descendant.isBracketed()).to.equal(expected);
        }

        it("should return true when bracketed", () => {
            doTest("/** @param {Object} [t] - String */\nfunction test() {}", true);
        });

        it("should return false when not bracketed", () => {
            doTest("/** @param {Object} t - String */\nfunction test() {}", false);
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
