import { expect } from "chai";
import { ClassDeclaration, MethodDeclaration, OverrideableNode } from "../../../../compiler";
import { OverrideableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(OverrideableNode), () => {
    describe("navigation", () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("class C { override method1() {} method2() {} }");
        const overrideMethod = firstChild.getMethods()[0];
        const nonOverrideMethod = firstChild.getMethods()[1];

        describe(nameof<OverrideableNode>(n => n.hasOverrideKeyword), () => {
            it("should be when is", () => {
                expect(overrideMethod.hasOverrideKeyword()).to.be.true;
            });

            it("should not be when not", () => {
                expect(nonOverrideMethod.hasOverrideKeyword()).to.be.false;
            });
        });

        describe(nameof<OverrideableNode>(n => n.getOverrideKeyword), () => {
            it("should have one when does", () => {
                expect(overrideMethod.getOverrideKeyword()!.getText()).to.equal("override");
                expect(overrideMethod.getOverrideKeywordOrThrow().getText()).to.equal("override");
            });

            it("should not have a keyword when not", () => {
                expect(nonOverrideMethod.getOverrideKeyword()).to.be.undefined;
                expect(() => nonOverrideMethod.getOverrideKeywordOrThrow()).to.throw();
            });
        });
    });

    describe(nameof<OverrideableNode>(n => n.setHasOverrideKeyword), () => {
        function doTest(text: string, value: boolean, expected: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
            firstChild.getMethods()[0].setHasOverrideKeyword(value);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should set as when not", () => {
            doTest("class C { public async method1() {} }", true, "class C { public override async method1() {} }");
        });

        it("should set as not when is", () => {
            doTest("class C { override method1() {} }", false, "class C { method1() {} }");
        });
    });

    describe(nameof<MethodDeclaration>(n => n.getStructure), () => {
        function doTest(startingCode: string, hasOverrideKeyword: boolean) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(startingCode);
            expect(firstChild.getMethods()[0].getStructure().hasOverrideKeyword).to.equal(hasOverrideKeyword);
        }

        it("should get when is", () => {
            doTest("class C { override method1() {} }", true);
        });

        it("should get when is not", () => {
            doTest("class C { method1() {} }", false);
        });
    });

    describe(nameof<MethodDeclaration>(n => n.set), () => {
        function doTest(startCode: string, structure: OverrideableNodeStructure, expectedCode: string) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
            firstChild.getMethods()[0].set(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when false and setting true", () => {
            doTest("class C { method() {} }", { hasOverrideKeyword: true }, "class C { override method() {} }");
        });

        it("should modify when true and setting false", () => {
            doTest("class C { override method() {} }", { hasOverrideKeyword: false }, "class C { method() {} }");
        });

        it("should not modify when false and setting false", () => {
            doTest("class C { method() {} }", { hasOverrideKeyword: false }, "class C { method() {} }");
        });

        it("should not modify when true and setting true", () => {
            doTest("class C { override method() {} }", { hasOverrideKeyword: true }, "class C { override method() {} }");
        });

        it("should not modify when false and no property provided", () => {
            doTest("class C { method() {} }", {}, "class C { method() {} }");
        });

        it("should not modify when true and no property provided", () => {
            doTest("class C { override method() {} }", {}, "class C { override method() {} }");
        });
    });
});
