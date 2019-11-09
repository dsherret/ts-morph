import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxAttributedNode, JsxAttributeLike, Node } from "../../../../../compiler";
import { JsxAttributeStructure, JsxSpreadAttributeStructure, OptionalKind, StructureKind } from "../../../../../structures";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxAttributedNode & Node>(text, SyntaxKind.JsxOpeningElement, { isJsx: true });
}

function getInfoFromSelfClosing(text: string) {
    return getInfoFromTextWithDescendant<JsxAttributedNode & Node>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe(nameof(JsxAttributedNode), () => {
    describe(nameof<JsxAttributedNode>(n => n.getAttributes), () => {
        function doTest(text: string, expected: string[]) {
            const { descendant } = getInfo(text);
            expect(descendant.getAttributes().map(c => c.getText())).to.deep.equal(expected);
        }

        it("should get the attributes", () => {
            doTest(`var t = (<jsx attrib1 attrib2={5} {...attribs}></jsx>);`, ["attrib1", "attrib2={5}", "{...attribs}"]);
        });
    });

    describe(nameof<JsxAttributedNode>(n => n.getAttribute), () => {
        function doNameTest(text: string, name: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            const attrib = descendant.getAttribute(name);
            expect(attrib?.getText()).to.equal(expected);
        }

        it("should get the correct attribute", () => {
            doNameTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, "attrib3", "attrib3={7}");
        });

        it("should return undefined when not found", () => {
            doNameTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, "attrib4", undefined);
        });

        function doFindFunctionTest(text: string, findFunc: (attrib: JsxAttributeLike) => boolean, expected: string | undefined) {
            const { descendant } = getInfo(text);
            const attrib = descendant.getAttribute(findFunc);
            expect(attrib?.getText()).to.equal(expected);
        }

        it("should get the correct attribute using a find function", () => {
            doFindFunctionTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, attrib => attrib.getText() === "attrib1", "attrib1");
        });

        it("should be undefined when can't find using a find function", () => {
            doFindFunctionTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, attrib => false, undefined);
        });
    });

    describe(nameof<JsxAttributedNode>(n => n.getAttributeOrThrow), () => {
        function doNameTest(text: string, name: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            if (expected == null)
                expect(() => descendant.getAttributeOrThrow(name)).to.throw();
            else
                expect(descendant.getAttributeOrThrow(name).getText()).to.equal(expected);
        }

        it("should get the correct attribute", () => {
            doNameTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, "attrib3", "attrib3={7}");
        });

        it("should return undefined when not found", () => {
            doNameTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, "attrib4", undefined);
        });
    });

    describe(nameof<JsxAttributedNode>(n => n.insertAttributes), () => {
        describe("element", () => {
            function doTest(text: string, index: number, structures: (OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure)[], expected: string) {
                const { descendant } = getInfo(text);
                expect(descendant.insertAttributes(index, structures).length).to.equal(structures.length);
                expect(descendant.getFullText()).to.equal(expected);
            }

            it("should do nothing when providing an empty array", () => {
                doTest(`var t = (<jsx></jsx>);`, 0, [], `<jsx>`);
            });

            it("should insert the attributes when none exists", () => {
                doTest(`var t = (<jsx></jsx>);`, 0, [{ name: "attrib" }], `<jsx attrib>`);
            });

            it("should insert the attributes in the middle", () => {
                doTest(`var t = (<jsx attrib attrib5={2}></jsx>);`, 1,
                    [{ name: "attrib2" }, { name: "attrib3", initializer: "{3}" }, { expression: "attrib4", kind: StructureKind.JsxSpreadAttribute }],
                    `<jsx attrib attrib2 attrib3={3} ...attrib4 attrib5={2}>`);
            });

            it("should insert the attributes at the end", () => {
                doTest(`var t = (<jsx attrib></jsx>);`, 1, [{ name: "attrib2" }], `<jsx attrib attrib2>`);
            });
        });

        describe("self closing", () => {
            function doTest(text: string, index: number, structures: OptionalKind<JsxAttributeStructure>[], expected: string) {
                const { descendant } = getInfoFromSelfClosing(text);
                expect(descendant.insertAttributes(index, structures).length).to.equal(structures.length);
                expect(descendant.getFullText()).to.equal(expected);
            }

            it("should insert the attributes when none exists", () => {
                doTest(`var t = (<jsx />);`, 0, [{ name: "attrib" }], `<jsx attrib />`);
            });

            it("should insert the attributes at the end", () => {
                doTest(`var t = (<jsx attrib />);`, 1, [{ name: "attrib2" }], `<jsx attrib attrib2 />`);
            });
        });
    });

    describe(nameof<JsxAttributedNode>(n => n.insertAttribute), () => {
        function doTest(text: string, index: number, structure: OptionalKind<JsxAttributeStructure>, expected: string) {
            const { descendant } = getInfo(text);
            descendant.insertAttribute(index, structure);
            expect(descendant.getFullText()).to.equal(expected);
        }

        it("should insert the attribute", () => {
            doTest(`var t = (<jsx attrib></jsx>);`, 1, { name: "attrib1" }, `<jsx attrib attrib1>`);
        });
    });

    describe(nameof<JsxAttributedNode>(n => n.addAttributes), () => {
        function doTest(text: string, structures: OptionalKind<JsxAttributeStructure>[], expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.addAttributes(structures).length).to.equal(structures.length);
            expect(descendant.getFullText()).to.equal(expected);
        }

        it("should add the attributes", () => {
            doTest(`var t = (<jsx a1></jsx>);`, [{ name: "a2" }, { name: "a3" }], `<jsx a1 a2 a3>`);
        });
    });

    describe(nameof<JsxAttributedNode>(n => n.addAttribute), () => {
        function doTest(text: string, structure: OptionalKind<JsxAttributeStructure>, expected: string) {
            const { descendant } = getInfo(text);
            descendant.addAttribute(structure);
            expect(descendant.getFullText()).to.equal(expected);
        }

        it("should add the attributes", () => {
            doTest(`var t = (<jsx a1></jsx>);`, { name: "a2" }, `<jsx a1 a2>`);
        });
    });
});
