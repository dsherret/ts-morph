import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ConstructorTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ConstructorTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ConstructorTypeNode>(text, SyntaxKind.ConstructorType);
    }

    describe(nameof<ConstructorTypeNode>(d => d.getReturnTypeNodeOrThrow), () => {
        it("should get the return type", () => {
            const { descendant } = getNode("var t: new() => SomeClass;");
            expect(descendant.getReturnTypeNodeOrThrow().getText()).to.equal("SomeClass");
        });
    });

    describe(nameof<ConstructorTypeNode>(d => d.getParameters), () => {
        it("should get the parameters", () => {
            const { descendant } = getNode("var t: new(param1, param2) => SomeClass;");
            expect(descendant.getParameters().map(p => p.getText())).to.deep.equal(["param1", "param2"]);
        });
    });

    describe(nameof<ConstructorTypeNode>(d => d.isAbstract), () => {
        function doTest(text: string, value: boolean) {
            const { descendant } = getNode(text);
            expect(descendant.isAbstract()).to.equal(value);
        }

        it("should get if abstract", () => {
            doTest("type Test = abstract new() => String;", true);
        });

        it("should get when not abstract", () => {
            doTest("type Test = new() => String;", false);
        });
    });

    describe(nameof<ConstructorTypeNode>(d => d.setIsAbstract), () => {
        function doTest(text: string, value: boolean, expectedText: string) {
            const { sourceFile, descendant } = getNode(text);
            descendant.setIsAbstract(value);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set as abstract", () => {
            doTest("type Test = new() => String;", true, "type Test = abstract new() => String;");
        });

        it("should set as not abstract", () => {
            doTest("type Test = abstract new() => String;", false, "type Test = new() => String;");
        });
    });
});
