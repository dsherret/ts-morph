import { expect } from "chai";
import { JsxSelfClosingElement, JsxSpreadAttribute } from "../../../compiler";
import * as errors from "../../../errors";
import { JsxSpreadAttributeStructure } from "../../../structures";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxSpreadAttribute>(text, SyntaxKind.JsxSpreadAttribute, { isJsx: true });
}

function getInfoForSelfClosingElement(text: string) {
    return getInfoFromTextWithDescendant<JsxSelfClosingElement>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe(nameof(JsxSpreadAttribute), () => {
    describe(nameof<JsxSpreadAttribute>(n => n.getExpression), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getExpression().getText()).to.equal(expected);
        }

        it("should get the expression", () => {
            doTest(`var t = (<jsx {...test} />);`, "test");
        });
    });

    describe(nameof<JsxSpreadAttribute>(n => n.setExpression), () => {
        function doTest(text: string, expression: string, expected: string) {
            const { descendant, sourceFile } = getInfo(text);
            descendant.setExpression(expression);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should set", () => {
            doTest(`var t = (<jsx {...test} />);`, "newExpr", `var t = (<jsx {...newExpr} />);`);
        });
    });

    describe(nameof<JsxSpreadAttribute>(n => n.remove), () => {
        function doTest(text: string, index: number, expected: string) {
            const { descendant, sourceFile } = getInfoForSelfClosingElement(text);
            (descendant.getAttributes()[index] as JsxSpreadAttribute).remove();
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should remove the only attribute", () => {
            doTest(`var t = (<jsx {...attribute} />);`, 0, `var t = (<jsx />);`);
        });

        it("should remove the attribute at the start", () => {
            doTest(`var t = (<jsx {...attribute} a2 />);`, 0, `var t = (<jsx a2 />);`);
        });

        it("should remove the attribute in the middle", () => {
            doTest(`var t = (<jsx a1 {...a2} a3 />);`, 1, `var t = (<jsx a1 a3 />);`);
        });

        it("should remove the attribute at the end", () => {
            doTest(`var t = (<jsx {...a1} {...a2} />);`, 1, `var t = (<jsx {...a1} />);`);
        });

        it("should remove the attribute at the end when on a new line", () => {
            doTest(`var t = (<jsx a1\n    {...a2} />);`, 1, `var t = (<jsx a1 />);`);
        });
    });

    describe(nameof<JsxSpreadAttribute>(n => n.set), () => {
        function doTest(text: string, structure: Partial<JsxSpreadAttributeStructure>, expected: string) {
            const { descendant, sourceFile } = getInfo(text);
            descendant.set(structure);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should not change when empty", () => {
            const code = "const v = <div {...attr} />";
            doTest(code, {}, code);
        });

        it("should change when all set", () => {
            const structure: MakeRequired<JsxSpreadAttributeStructure> = {
                isSpreadAttribute: true,
                expression: "newExpr"
            };
            doTest("const v = <div {...attr} />", structure, "const v = <div {...newExpr} />");
        });

        function doNotImplementedTest(text: string, structure: Partial<JsxSpreadAttributeStructure>) {
            const { descendant } = getInfo(text);
            expect(() => descendant.set(structure)).to.throw(errors.NotImplementedError);
        }

        it("should throw when setting as non spread attribute -- not implemented", () => {
            // force setting as false
            doNotImplementedTest("const v = <element {...attr} />;", { isSpreadAttribute: false as true });
        });
    });

    describe(nameof<JsxSpreadAttribute>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: MakeRequired<JsxSpreadAttributeStructure>) {
            const { descendant } = getInfo(text);
            const structure = descendant.getStructure();
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get the structure", () => {
            doTest(`var t = (<jsx {...a1} />`, {
                isSpreadAttribute: true,
                expression: "a1"
            });
        });
    });
});
