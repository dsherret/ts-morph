import { expect } from "chai";
import { ts, SyntaxKind } from "../../../typescript";
import { ImportTypeNode } from "../../../compiler";
import { getInfoFromTextWithDescendant } from "../testHelpers";

describe(nameof(ImportTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ImportTypeNode>(text, SyntaxKind.ImportType);
    }

    describe(nameof<ImportTypeNode>(d => d.getArgument), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getNode(text);
            expect(descendant.getArgument().getText()).to.equal(expected);
        }

        it("should get the argument", () => {
            doTest("var t: import('testing');", "'testing'");
        });
    });

    describe(nameof<ImportTypeNode>(d => d.getQualifier), () => {
        function doTest(text: string, expected: string | undefined) {
            const {descendant} = getNode(text);
            if (expected == null)
                expect(descendant.getQualifier()).to.be.undefined;
            else
                expect(descendant.getQualifier()!.getText()).to.equal(expected);
        }

        it("should get the qualifier when it exists", () => {
            doTest("var t: import('testing').Test;", "Test");
        });

        it("should be undefined when it doesn't exist", () => {
            doTest("var t: import('testing');", undefined);
        });
    });

    describe(nameof<ImportTypeNode>(d => d.getQualifierOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const {descendant} = getNode(text);
            if (expected == null)
                expect(() => descendant.getQualifierOrThrow()).to.throw();
            else
                expect(descendant.getQualifierOrThrow().getText()).to.equal(expected);
        }

        it("should get the qualifier when it exists", () => {
            doTest("var t: import('testing').Test;", "Test");
        });

        it("should be undefined when it doesn't exist", () => {
            doTest("var t: import('testing');", undefined);
        });
    });
});
