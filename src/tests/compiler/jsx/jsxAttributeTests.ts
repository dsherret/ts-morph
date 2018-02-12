import {expect} from "chai";
import {ts, SyntaxKind} from "./../../../typescript";
import {JsxAttribute} from "./../../../compiler";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxAttribute>(text, SyntaxKind.JsxAttribute, { isJsx: true });
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
});
