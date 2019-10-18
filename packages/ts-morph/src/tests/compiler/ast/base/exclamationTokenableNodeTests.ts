import { expect } from "chai";
import { ClassDeclaration, ExclamationTokenableNode, PropertyDeclaration, VariableStatement } from "../../../../compiler";
import { errors } from "@ts-morph/common";
import { ExclamationTokenableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ExclamationTokenableNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return { ...result, firstProperty: result.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    function getInfoWithFirstVariableDeclarationFromText(text: string) {
        const result = getInfoFromText<VariableStatement>(text);
        return { ...result, firstDeclaration: result.firstChild.getDeclarations()[0] };
    }

    describe(nameof<ExclamationTokenableNode>(d => d.hasExclamationToken), () => {
        function doTest(text: string, value: boolean) {
            const { firstProperty } = getInfoWithFirstPropertyFromText(text);
            expect(firstProperty.hasExclamationToken()).to.equal(value);
        }

        it("should have a exclamation token when has one", () => {
            doTest("class MyClass { prop!: string; }", true);
        });

        it("should not have a exclamation token when not has one", () => {
            doTest("class MyClass { prop: string; }", false);
        });
    });

    describe(nameof<ExclamationTokenableNode>(d => d.getExclamationTokenNode), () => {
        it("should be get the exclamation token node", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass { prop!: string; }");
            expect(firstProperty.getExclamationTokenNode()!.getText()).to.equal("!");
        });

        it("should be undefined when no exclamation token", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass { prop: string; }");
            expect(firstProperty.getExclamationTokenNode()).to.be.undefined;
        });
    });

    describe(nameof<ExclamationTokenableNode>(d => d.getExclamationTokenNodeOrThrow), () => {
        it("should be get the exclamation token node", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass { prop!: string;} ");
            expect(firstProperty.getExclamationTokenNodeOrThrow().getText()).to.equal("!");
        });

        it("should throw when no exclamation token", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass { prop: string; } ");
            expect(() => firstProperty.getExclamationTokenNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<ExclamationTokenableNode>(d => d.setHasExclamationToken), () => {
        function doTest(startText: string, value: boolean, expected: string) {
            const { firstProperty, sourceFile } = getInfoWithFirstPropertyFromText(startText);
            firstProperty.setHasExclamationToken(value);
            expect(sourceFile.getFullText()).to.be.equal(expected);
        }

        it("should be set as having one when not", () => {
            doTest("class MyClass { prop: string; }", true, "class MyClass { prop!: string; }");
        });

        it("should be set as having when when has a question token", () => {
            doTest("class MyClass { prop?: string; }", true, "class MyClass { prop!: string; }");
        });

        it("should be set as not having one when has one", () => {
            doTest("class MyClass { prop!: string; }", false, "class MyClass { prop: string; }");
        });

        it("should do nothing when not changing", () => {
            doTest("class MyClass { prop: string; }", false, "class MyClass { prop: string; }");
        });

        function doVariableDeclarationTest(startText: string, value: boolean, expected: string) {
            const { firstDeclaration, sourceFile } = getInfoWithFirstVariableDeclarationFromText(startText);
            firstDeclaration.setHasExclamationToken(value);
            expect(sourceFile.getFullText()).to.be.equal(expected);
        }

        it("should set as having one when it has a type", () => {
            doVariableDeclarationTest("const t: string;", true, "const t!: string;");
        });

        it("should throw when it doesn't have a type for a variable", () => {
            expect(() => {
                const { firstDeclaration, sourceFile } = getInfoWithFirstVariableDeclarationFromText("const t;");
                firstDeclaration.setHasExclamationToken(true);
            }).to.throw(errors.InvalidOperationError);
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.set), () => {
        function doTest(startCode: string, structure: ExclamationTokenableNodeStructure, expectedCode: string) {
            const { firstProperty, sourceFile } = getInfoWithFirstPropertyFromText(startCode);
            firstProperty.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify when not set and structure empty", () => {
            doTest("class Identifier { prop: string; }", {}, "class Identifier { prop: string; }");
        });

        it("should not modify when set and structure empty", () => {
            doTest("class Identifier { prop!: string; }", {}, "class Identifier { prop!: string; }");
        });

        it("should modify when setting true", () => {
            doTest("class Identifier { prop: string; }", { hasExclamationToken: true }, "class Identifier { prop!: string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.getStructure), () => {
        function doTest(startCode: string, hasToken: boolean) {
            const { firstProperty, sourceFile } = getInfoWithFirstPropertyFromText(startCode);
            expect(firstProperty.getStructure().hasExclamationToken).to.equal(hasToken);
        }

        it("should be false when doesn't have", () => {
            doTest("class Identifier { prop: string; }", false);
        });

        it("should be false when has", () => {
            doTest("class Identifier { prop!: string; }", true);
        });
    });
});
