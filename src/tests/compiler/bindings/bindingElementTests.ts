import { expect } from "chai";
import { BindingElement } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfoFromTextWithBindingElement(text: string) {
    const info = getInfoFromTextWithDescendant<BindingElement>(text, SyntaxKind.BindingElement);
    return { ...info, bindingElement: info.descendant };
}

describe(nameof(BindingElement), () => {
    describe(nameof<BindingElement>(n => n.getName), () => {
        function doTest(text: string, name: string) {
            const { bindingElement } = getInfoFromTextWithBindingElement(text);
            expect(bindingElement.getName()).to.equal(name);
        }

        it("should get the name", () => {
            doTest("const [v] = [];", "v");
        });

        it("should get the name when using spread syntax", () => {
            doTest("const [...v] = [];", "v");
        });

        it("should get the name when there's no property name", () => {
            doTest("const { a } = { a: 1 };", "a");
        });

        it("should get the name when there's a property name", () => {
            doTest("const { a: b } = { a: 1 };", "b");
        });
    });

    describe(nameof<BindingElement>(n => n.getDotDotDotToken), () => {
        function doTest(text: string, shouldExist: boolean) {
            const { bindingElement } = getInfoFromTextWithBindingElement(text);
            if (shouldExist)
                expect(bindingElement.getDotDotDotToken()!.getText()).to.equal("...");
            else
                expect(bindingElement.getDotDotDotToken()).to.be.undefined;
        }

        it("should get when it exists", () => {
            doTest("const [...v] = [];", true);
        });

        it("should return undefined when it doesn't exit", () => {
            doTest("const [v] = [];", false);
        });
    });

    describe(nameof<BindingElement>(n => n.getPropertyNameNode), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const { bindingElement } = getInfoFromTextWithBindingElement(text);
            if (expectedName == null)
                expect(bindingElement.getPropertyNameNode()).to.be.undefined;
            else
                expect(bindingElement.getPropertyNameNode()!.getText()).to.equal(expectedName);
        }

        it("should get when it exists", () => {
            doTest("const { a: b } = { a: 1 };", "a");
        });

        it("should return undefined when it doesn't exit", () => {
            doTest("const { a } = { a: 1 };", undefined);
        });
    });
});
