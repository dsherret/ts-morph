import {expect} from "chai";
import {SyntaxKind} from "./../../../../typescript";
import {JsxAttributedNode, JsxAttributeLike, Node} from "./../../../../compiler";
import {getInfoFromTextWithDescendant} from "./../../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxAttributedNode & Node>(text, SyntaxKind.JsxOpeningElement, { isJsx: true });
}

describe(nameof(JsxAttributedNode), () => {
    describe(nameof<JsxAttributedNode>(n => n.getAttributes), () => {
        function doTest(text: string, expected: string[]) {
            const {descendant} = getInfo(text);
            expect(descendant.getAttributes().map(c => c.getText())).to.deep.equal(expected);
        }

        it("should get the attributes", () => {
            doTest(`var t = (<jsx attrib1 attrib2={5} {...attribs}></jsx>);`, ["attrib1", "attrib2={5}", "{...attribs}"]);
        });
    });

    describe(nameof<JsxAttributedNode>(n => n.getAttribute), () => {
        function doNameTest(text: string, name: string, expected: string | undefined) {
            const {descendant} = getInfo(text);
            const attrib = descendant.getAttribute(name);
            if (expected == null)
                expect(attrib).to.be.undefined;
            else
                expect(attrib!.getText()).to.equal(expected);
        }

        it("should get the correct attribute", () => {
            doNameTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, "attrib3", "attrib3={7}");
        });

        it("should return undefined when not found", () => {
            doNameTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, "attrib4", undefined);
        });

        function doFindFunctionTest(text: string, findFunc: (attrib: JsxAttributeLike) => boolean, expected: string | undefined) {
            const {descendant} = getInfo(text);
            const attrib = descendant.getAttribute(findFunc);
            if (expected == null)
                expect(attrib).to.be.undefined;
            else
                expect(attrib!.getText()).to.equal(expected);
        }

        it("should get the correct attribute using a find function", () => {
            doFindFunctionTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, attrib => attrib.getText() === "attrib1", "attrib1");
        });

        it("should be undefined when can't find using a find function", () => {
            doFindFunctionTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} attrib3={7}></jsx>);`, attrib => false, undefined);
        });
    });
});
