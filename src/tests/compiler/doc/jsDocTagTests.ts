import { expect } from "chai";
import { JSDocTag } from "../../../compiler";
import { TypeGuards } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

describe(nameof(JSDocTag), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(TypeGuards.isJSDocTag), ...info };
    }

    describe(nameof<JSDocTag>(d => d.getAtToken), () => {
        it("should get the at token", () => {
            const { descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            expect(descendant.getAtToken().getText()).to.equal("@");
        });
    });

    describe(nameof<JSDocTag>(d => d.getTagName), () => {
        it("should get the tag name", () => {
            const { descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            expect(descendant.getTagName()).to.equal("param");
        });
    });

    describe(nameof<JSDocTag>(d => d.getTagNameNode), () => {
        it("should get the tag name node", () => {
            const { descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            expect(descendant.getTagNameNode().getText()).to.equal("param");
        });
    });

    describe(nameof<JSDocTag>(d => d.getComment), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getComment()).to.equal(expected);
        }

        it("should get the tag comment", () => {
            doTest("/** @param t - String*/\nfunction test() {}", "- String");
        });

        it("should return undefined when not exists", () => {
            doTest("/** @param */\nfunction test() {}", undefined);
        });
    });
});
