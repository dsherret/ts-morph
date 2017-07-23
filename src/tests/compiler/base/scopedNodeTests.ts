import {expect} from "chai";
import {ScopedNode, ClassDeclaration, PropertyDeclaration, Scope} from "./../../../compiler";
import {ScopedNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ScopedNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return {...result, firstProperty: result.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<ScopedNode>(d => d.getScope), () => {
        it("should get the correct scope when there is no modifier", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class Identifier {\nprop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Public);
        });

        it("should get the correct scope when there is a public modifier", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class Identifier {\npublic prop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Public);
        });

        it("should get the correct scope when there is a protected modifier", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class Identifier {\nprotected prop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Protected);
        });

        it("should get the correct scope when there is a private modifier", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class Identifier {\nprivate prop: string;}\n");
            expect(firstProperty.getScope()).to.be.equal(Scope.Private);
        });
    });

    describe(nameof<ScopedNode>(d => d.hasScopeKeyword), () => {
        it("should not have a scope keyword when there isn't one", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class Identifier {\nprop: string;}\n");
            expect(firstProperty.hasScopeKeyword()).to.be.false;
        });

        it("should have a scope keyword when there is one", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class Identifier {\npublic prop: string;}\n");
            expect(firstProperty.hasScopeKeyword()).to.be.true;
        });
    });

    describe(nameof<ScopedNode>(d => d.setScope), () => {
        it("should clear the scope keyword if set to public", () => {
            const {firstChild, firstProperty} = getInfoWithFirstPropertyFromText("class Identifier { private prop: string; }");
            firstProperty.setScope(Scope.Public);
            expect(firstChild.getText()).to.be.equal("class Identifier { prop: string; }");
        });

        it("should clear the scope keyword if set to public even when public", () => {
            const {firstChild, firstProperty} = getInfoWithFirstPropertyFromText("class Identifier { public prop: string; }");
            firstProperty.setScope(Scope.Public);
            expect(firstChild.getText()).to.be.equal("class Identifier { prop: string; }");
        });

        it("should set the scope keyword to protected when specified", () => {
            const {firstChild, firstProperty} = getInfoWithFirstPropertyFromText("class Identifier { private prop: string; }");
            firstProperty.setScope(Scope.Protected);
            expect(firstChild.getText()).to.be.equal("class Identifier { protected prop: string; }");
        });

        it("should set the scope keyword to private when specified", () => {
            const {firstChild, firstProperty} = getInfoWithFirstPropertyFromText("class Identifier { protected prop: string; }");
            firstProperty.setScope(Scope.Private);
            expect(firstChild.getText()).to.be.equal("class Identifier { private prop: string; }");
        });

        it("should set the scope keyword when none exists and setting to not public", () => {
            const {firstChild, firstProperty} = getInfoWithFirstPropertyFromText("class Identifier { prop: string; }");
            firstProperty.setScope(Scope.Private);
            expect(firstChild.getText()).to.be.equal("class Identifier { private prop: string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.fill), () => {
        function doTest(startCode: string, structure: ScopedNodeStructure, expectedCode: string) {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText(startCode);
            firstProperty.fill(structure);
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
    });
});
