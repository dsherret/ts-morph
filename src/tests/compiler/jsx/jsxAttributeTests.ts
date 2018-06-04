import { expect } from "chai";
import { JsxAttribute, JsxSelfClosingElement } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxAttribute>(text, SyntaxKind.JsxAttribute, { isJsx: true });
}

function getInfoForSelfClosingElement(text: string) {
    return getInfoFromTextWithDescendant<JsxSelfClosingElement>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe(nameof(JsxAttribute), () => {
    describe(nameof<JsxAttribute>(n => n.getName), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getName()).to.equal(expected);
        }

        it("should get the name", () => {
            doTest(`var t = (<jsx attribute="4" />);`, "attribute");
        });
    });

    describe(nameof<JsxAttribute>(n => n.rename), () => {
        function doTest(text: string, newName: string, expected: string) {
            const {descendant, sourceFile} = getInfo(text);
            descendant.rename(newName);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should get the name", () => {
            doTest(`var t = (<jsx attribute="4" />);`, "newName", `var t = (<jsx newName="4" />);`);
        });
    });

    describe(nameof<JsxAttribute>(n => n.getInitializer), () => {
        function doTest(text: string, expected: string | undefined) {
            const {descendant} = getInfo(text);
            const initializer = descendant.getInitializer();
            if (expected == null)
                expect(initializer).to.be.undefined;
            else {
                expect(initializer).to.not.be.undefined;
                expect(initializer!.getText()).to.equal(expected);
            }
        }

        it("should get the initializer when it exists and is a string literal", () => {
            doTest(`var t = (<jsx attribute="4" />);`, `"4"`);
        });

        it("should get the initializer when it exists and is an expression", () => {
            doTest(`var t = (<jsx attribute={4} />);`, `{4}`);
        });

        it("should return undefined when the initializer does not exists", () => {
            doTest(`var t = (<jsx attribute />);`, undefined);
        });
    });

    describe(nameof<JsxAttribute>(n => n.getInitializerOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            if (expected == null)
                expect(() => descendant.getInitializerOrThrow()).to.throw();
            else
                expect(descendant.getInitializerOrThrow().getText()).to.equal(expected);
        }

        it("should get the initializer when it exists", () => {
            doTest(`var t = (<jsx attribute="4" />);`, `"4"`);
        });

        it("should throw when the initializer does not exists", () => {
            doTest(`var t = (<jsx attribute />);`, undefined);
        });
    });

    describe(nameof<JsxAttribute>(n => n.remove), () => {
        function doTest(text: string, index: number, expected: string) {
            const {descendant, sourceFile} = getInfoForSelfClosingElement(text);
            (descendant.getAttributes()[index] as JsxAttribute).remove();
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should remove the only attribute", () => {
            doTest(`var t = (<jsx attribute="4" />);`, 0, `var t = (<jsx />);`);
        });

        it("should remove the attribute at the start", () => {
            doTest(`var t = (<jsx attribute="4" a2 />);`, 0, `var t = (<jsx a2 />);`);
        });

        it("should remove the attribute in the middle", () => {
            doTest(`var t = (<jsx a1 a2 a3 />);`, 1, `var t = (<jsx a1 a3 />);`);
        });

        it("should remove the attribute at the end", () => {
            doTest(`var t = (<jsx a1 a2 />);`, 1, `var t = (<jsx a1 />);`);
        });

        it("should remove the attribute at the end when on a new line", () => {
            doTest(`var t = (<jsx a1\n    a2 />);`, 1, `var t = (<jsx a1 />);`);
        });
    });
});
