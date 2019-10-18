import { expect } from "chai";
import { errors, SyntaxKind } from "@ts-morph/common";
import { JsxElement } from "../../../../compiler";
import { JsxElementStructure, JsxAttributeStructure, StructureKind } from "../../../../structures";
import { getInfoFromTextWithDescendant, OptionalTrivia, OptionalKindAndTrivia } from "../../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxElement>(text, SyntaxKind.JsxElement, { isJsx: true });
}

describe(nameof(JsxElement), () => {
    describe(nameof<JsxElement>(n => n.getOpeningElement), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getOpeningElement().getText()).to.equal(expected);
        }

        it("should get the opening element", () => {
            doTest(`var t = (<jsx></jsx>);`, "<jsx>");
        });
    });

    describe(nameof<JsxElement>(n => n.getClosingElement), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getClosingElement().getText()).to.equal(expected);
        }

        it("should get the closing element", () => {
            doTest(`var t = (<jsx></jsx>);`, "</jsx>");
        });
    });

    describe(nameof<JsxElement>(n => n.getJsxChildren), () => {
        function doTest(text: string, expected: string[]) {
            const { descendant } = getInfo(text);
            expect(descendant.getJsxChildren().map(c => c.getText())).to.deep.equal(expected);
        }

        it("should get the children", () => {
            doTest(`var t = (<jsx>\n    <Child1 />\n    <Child2 />\n</jsx>);`, ["", "<Child1 />", "", "<Child2 />", ""]);
        });
    });

    describe(nameof<JsxElement>(n => n.setBodyText), () => {
        function doTest(text: string, bodyText: string, expected: string) {
            const { descendant, sourceFile } = getInfo(text);
            descendant.setBodyText(bodyText);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should set the body text", () => {
            doTest("var t = (<jsx></jsx>);", "<element />", "var t = (<jsx>\n    <element />\n</jsx>);");
        });

        it("should set the body text when currently on multiple lines", () => {
            doTest("var t = (\n    <jsx>\n    </jsx>);", "<element />", "var t = (\n    <jsx>\n        <element />\n    </jsx>);");
        });

        it("should set the body text when specifying multiple lines", () => {
            doTest("var t = (<jsx></jsx>);", "<element>\n</element>", "var t = (<jsx>\n    <element>\n    </element>\n</jsx>);");
        });

        it("should set the body text when specifying multiple lines and other elements exist", () => {
            doTest("var t = (<jsx>   <Element> </Element>   </jsx>);", "<element>\n</element>", "var t = (<jsx>\n    <element>\n    </element>\n</jsx>);");
        });
    });

    describe(nameof<JsxElement>(n => n.setBodyTextInline), () => {
        function doTest(text: string, bodyText: string, expected: string) {
            const { descendant, sourceFile } = getInfo(text);
            descendant.setBodyTextInline(bodyText);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should set the body text inline", () => {
            doTest("var t = (<jsx></jsx>);", "<element />", "var t = (<jsx><element /></jsx>);");
        });

        it("should set the body text inline when other elements exist", () => {
            doTest("var t = (<jsx><element2 /></jsx>);", "<element />", "var t = (<jsx><element /></jsx>);");
        });

        it("should indent if writing a new line", () => {
            doTest("var t = (<jsx></jsx>);", "<element>\n</element>", "var t = (<jsx><element>\n    </element></jsx>);");
        });

        it("should indent if ending with a new line", () => {
            doTest("var t = (<jsx></jsx>);", "<element>\n</element>\n", "var t = (<jsx><element>\n    </element>\n</jsx>);");
        });
    });

    describe(nameof<JsxElement>(n => n.set), () => {
        function doTest(text: string, structure: Partial<JsxElementStructure>, expected: string) {
            const { descendant, sourceFile } = getInfo(text);
            descendant.set(structure);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should not change when empty", () => {
            const code = "const v = <div attr><inner /></div>";
            doTest(code, {}, code);
        });

        it("should change when all set", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<JsxElementStructure>> = {
                attributes: [{ name: "attr" }],
                bodyText: "<newElement />",
                children: undefined,
                name: "newName"
            };
            doTest("const v = <div a1 a2><inner /></div>", structure, "const v = <newName attr>\n    <newElement />\n</newName>");
        });
    });

    describe(nameof<JsxElement>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<JsxElementStructure>>) {
            const { descendant } = getInfo(text);
            const structure = descendant.getStructure();

            structure.attributes = structure.attributes!.map(a => ({ name: (a as JsxAttributeStructure).name }));

            delete expectedStructure.children;
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get when has nothing", () => {
            doTest("const v = <div></div>", {
                kind: StructureKind.JsxElement,
                attributes: [],
                children: undefined,
                bodyText: "",
                name: "div"
            });
        });

        it("should get when has everything", () => {
            doTest("const v = <div a><Inner /></div>", {
                kind: StructureKind.JsxElement,
                attributes: [{ name: "a" }],
                children: undefined,
                bodyText: "<Inner />",
                name: "div"
            });
        });

        it("should get when has children on multiple lines", () => {
            const code = `
const v = <div>
    <Inner />
    <div></div>
</div>`;
            doTest(code, {
                kind: StructureKind.JsxElement,
                attributes: [],
                children: undefined,
                bodyText: "<Inner />\n<div></div>",
                name: "div"
            });
        });
    });
});
