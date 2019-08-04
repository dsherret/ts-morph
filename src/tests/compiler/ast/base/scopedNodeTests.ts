import { expect } from "chai";
import { ClassDeclaration, PropertyDeclaration, Scope, ScopedNode } from "../../../../compiler";
import { ScopedNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ScopedNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return { ...result, firstProperty: result.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<ScopedNode>(d => d.getScope), () => {
        it("should get the correct scope when there is no modifier", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class Identifier {\nprop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Public);
        });

        it("should get the correct scope when there is a public modifier", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class Identifier {\npublic prop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Public);
        });

        it("should get the correct scope when there is a protected modifier", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class Identifier {\nprotected prop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Protected);
        });

        it("should get the correct scope when there is a private modifier", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class Identifier {\nprivate prop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Private);
        });
    });

    describe(nameof<ScopedNode>(d => d.hasScopeKeyword), () => {
        it("should not have a scope keyword when there isn't one", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class Identifier {\nprop: string;}\n");
            expect(firstProperty.hasScopeKeyword()).to.be.false;
        });

        it("should have a scope keyword when there is one", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class Identifier {\npublic prop: string;}\n");
            expect(firstProperty.hasScopeKeyword()).to.be.true;
        });
    });

    describe(nameof<ScopedNode>(d => d.setScope), () => {
        function doTest(startText: string, scope: Scope | undefined, expectedText: string) {
            const { firstChild, firstProperty } = getInfoWithFirstPropertyFromText(startText);
            firstProperty.setScope(scope);
            expect(firstChild.getText()).to.be.equal(expectedText);
        }

        it("should clear the scope keyword if set to undefined", () => {
            doTest("class Identifier { private prop: string; }", undefined, "class Identifier { prop: string; }");
        });

        it("should leave the scoppe as is if set to public even when public", () => {
            doTest("class Identifier { public prop: string; }", Scope.Public, "class Identifier { public prop: string; }");
        });

        it("should set the scope keyword to public when specified", () => {
            doTest("class Identifier { private prop: string; }", Scope.Public, "class Identifier { public prop: string; }");
        });

        it("should set the scope keyword to protected when specified", () => {
            doTest("class Identifier { private prop: string; }", Scope.Protected, "class Identifier { protected prop: string; }");
        });

        it("should set the scope keyword to private when specified", () => {
            doTest("class Identifier { protected prop: string; }", Scope.Private, "class Identifier { private prop: string; }");
        });

        it("should set the scope keyword when none exists and setting to not public", () => {
            doTest("class Identifier { prop: string; }", Scope.Private, "class Identifier { private prop: string; }");
        });

        it("should set the scope keyword when none exists, a decorator exists, and setting to not public", () => {
            doTest("class Identifier { @dec prop: string; }", Scope.Private, "class Identifier { @dec private prop: string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.set), () => {
        function doTest(startCode: string, structure: ScopedNodeStructure, expectedCode: string) {
            const { firstProperty, sourceFile } = getInfoWithFirstPropertyFromText(startCode);
            firstProperty.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify when not set and structure empty", () => {
            doTest("class MyClass { prop: string; }", {}, "class MyClass { prop: string; }");
        });

        it("should not modify when set and structure empty", () => {
            doTest("class MyClass { public prop: string; }", {}, "class MyClass { public prop: string; }");
        });

        it("should modify when setting", () => {
            doTest("class MyClass { prop: string; }", { scope: Scope.Protected }, "class MyClass { protected prop: string; }");
        });

        it("should remove when exists, but undefined", () => {
            doTest("class MyClass { public prop: string; }", { scope: undefined }, "class MyClass { prop: string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.getStructure), () => {
        function doTest(startCode: string, scope: Scope | undefined) {
            const { firstProperty, sourceFile } = getInfoWithFirstPropertyFromText(startCode);
            expect(firstProperty.getStructure().scope).to.equal(scope);
        }

        it("should be undefined when not exists", () => {
            doTest("class MyClass { prop: string; }", undefined);
        });

        it("should get when exists", () => {
            doTest("class MyClass { public prop: string; }", Scope.Public);
        });
    });
});
