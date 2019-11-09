import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ImportTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ImportTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ImportTypeNode>(text, SyntaxKind.ImportType);
    }

    describe(nameof<ImportTypeNode>(d => d.getArgument), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getNode(text);
            expect(descendant.getArgument().getText()).to.equal(expected);
        }

        it("should get the argument", () => {
            doTest("var t: import('testing');", "'testing'");
        });
    });

    describe(nameof<ImportTypeNode>(d => d.setArgument), () => {
        function doTest(text: string, newValue: string, expected: string) {
            const { descendant } = getNode(text);
            descendant.setArgument(newValue);
            expect(descendant.getText()).to.equal(expected);
        }

        it("should set the argument using the quotes currently existing", () => {
            doTest("var t: import('testing');", "newVal", "import('newVal')");
        });

        it("should set the argument when no arg exists", () => {
            doTest("var t: import();", "newVal", `import("newVal")`);
        });
    });

    describe(nameof<ImportTypeNode>(d => d.getQualifier), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getNode(text);
            expect(descendant.getQualifier()?.getText()).to.equal(expected);
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
            const { descendant } = getNode(text);
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

    describe(nameof<ImportTypeNode>(d => d.setQualifier), () => {
        function doTest(text: string, newValue: string, expected: string) {
            const { descendant } = getNode(text);
            descendant.setQualifier(newValue);
            expect(descendant.getText()).to.equal(expected);
        }

        it("should set to an identifier when there is none", () => {
            doTest("var t: import('testing');", "newVal", "import('testing').newVal");
        });

        it("should set to a qualified name when there is none", () => {
            doTest("var t: import('testing');", "newVal.OtherProp", "import('testing').newVal.OtherProp");
        });

        it("should set to an identifier when it's an identifier", () => {
            doTest("var t: import('testing').otherVal;", "newVal", "import('testing').newVal");
        });

        it("should set to an identifier when it's a qualified name", () => {
            doTest("var t: import('testing').otherVal.Other;", "newVal", "import('testing').newVal");
        });

        it("should set to a qualified name when it's an identifier", () => {
            doTest("var t: import('testing').identifier;", "newVal.OtherProp", "import('testing').newVal.OtherProp");
        });

        it("should set to a qualified name when it's a qualified name", () => {
            doTest("var t: import('testing').qualified.name;", "newVal.OtherProp", "import('testing').newVal.OtherProp");
        });

        it("should set when there's a type arg on an identifier", () => {
            doTest("var t: import('testing').some<string>;", "newVal", `import('testing').newVal<string>`);
        });

        it("should set when there's a type arg on a qualified name", () => {
            doTest("var t: import('testing').some.qualified.name<string>;", "newVal", `import('testing').newVal<string>`);
        });
    });
});
