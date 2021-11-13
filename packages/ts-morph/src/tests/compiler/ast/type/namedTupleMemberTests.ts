import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { NamedTupleMember } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("NamedTupleMember", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<NamedTupleMember>(text, SyntaxKind.NamedTupleMember);
    }

    describe(nameof.property<NamedTupleMember>("getDotDotDotToken"), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getNode(text);
            expect(descendant.getDotDotDotToken()?.getText()).to.equal(expected);
        }

        it("should get the token when it exists", () => {
            doTest("type Range = [...rest: string[]]", "...");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("type Range = [rest: string]", undefined);
        });
    });

    describe(nameof.property<NamedTupleMember>("getName"), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getNode(text);
            expect(descendant.getName()).to.equal(expected);
        }

        it("should get the name", () => {
            doTest("type Range = [value: string]", "value");
        });
    });

    describe(nameof.property<NamedTupleMember>("getType"), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getNode(text);
            expect(descendant.getTypeNode()!.getText()).to.equal(expected); // todo: should be required
        }

        it("should get the type", () => {
            doTest("type Range = [value: string]", "string");
        });
    });

    describe(nameof.property<NamedTupleMember>("getQuestionTokenNode"), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getNode(text);
            expect(descendant.getQuestionTokenNode()?.getText()).to.equal(expected);
        }

        it("should get when exists", () => {
            doTest("type Range = [value?: string]", "?");
        });

        it("should get when not exists", () => {
            doTest("type Range = [value: string]", undefined);
        });
    });
});
