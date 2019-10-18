import { expect } from "chai";
import { ClassDeclaration, ParameterDeclaration, Scope, ScopeableNode } from "../../../../compiler";
import { ScopeableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ScopeableNode), () => {
    function getFirstParameter(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return { ...result, firstParam: result.firstChild.getConstructors()[0].getParameters()[0] };
    }

    describe(nameof<ScopeableNode>(d => d.getScope), () => {
        it("should return undefined when there's no scope", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(param: string) {} }");
            expect(firstParam.getScope()).to.be.undefined;
        });

        it("should return public when public", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Public);
        });

        it("should return protected when protected", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(protected param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Protected);
        });

        it("should return private when private", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(private param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Private);
        });

        it("should return public when readonly", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(readonly param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Public);
        });

        it("should return private when readonly and private", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(private readonly param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Private);
        });
    });

    describe(nameof<ScopeableNode>(d => d.hasScopeKeyword), () => {
        it("should not have one when there's no scope", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(param: string) {} }");
            expect(firstParam.hasScopeKeyword()).to.be.false;
        });

        it("should not have one when there's no scope and readonly", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(readonly param: string) {} }");
            expect(firstParam.hasScopeKeyword()).to.be.false;
        });

        it("should have one when there is a scope", () => {
            const { firstParam } = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            expect(firstParam.hasScopeKeyword()).to.be.true;
        });
    });

    describe(nameof<ScopeableNode>(d => d.setScope), () => {
        it("should set to public when set to public", () => {
            const { firstChild, firstParam } = getFirstParameter("class Identifier { constructor(param: string) {} }");
            firstParam.setScope(Scope.Public);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(public param: string) {} }");
        });

        it("should set to protected when set to protected", () => {
            const { firstChild, firstParam } = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            firstParam.setScope(Scope.Protected);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(protected param: string) {} }");
        });

        it("should set to private when set to private", () => {
            const { firstChild, firstParam } = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            firstParam.setScope(Scope.Private);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(private param: string) {} }");
        });

        it("should clear when set to undefined", () => {
            const { firstChild, firstParam } = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            firstParam.setScope(undefined);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(param: string) {} }");
        });
    });

    describe(nameof<ParameterDeclaration>(p => p.set), () => {
        function doTest(startCode: string, structure: ScopeableNodeStructure, expectedCode: string) {
            const { firstParam, sourceFile } = getFirstParameter(startCode);
            firstParam.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify when not set and structure empty", () => {
            doTest("class MyClass { constructor(param: string) {} }", {}, "class MyClass { constructor(param: string) {} }");
        });

        it("should not modify when set and structure empty", () => {
            doTest("class MyClass { constructor(public param: string) {} }", {}, "class MyClass { constructor(public param: string) {} }");
        });

        it("should modify when setting", () => {
            doTest("class MyClass { constructor(param: string) {} }", { scope: Scope.Protected }, "class MyClass { constructor(protected param: string) {} }");
        });

        it("should remove when undefined", () => {
            doTest("class MyClass { constructor(public param: string) {} }", { scope: undefined }, "class MyClass { constructor(param: string) {} }");
        });
    });

    describe(nameof<ParameterDeclaration>(p => p.getStructure), () => {
        function doTest(startCode: string, scope: Scope | undefined) {
            const { firstParam, sourceFile } = getFirstParameter(startCode);
            expect(firstParam.getStructure().scope).to.equal(scope);
        }

        it("should be undefined when not exists", () => {
            doTest("class MyClass { constructor(param: string) {} }", undefined);
        });

        it("should get when exists", () => {
            doTest("class MyClass { constructor(public param: string) {} }", Scope.Public);
        });
    });
});
