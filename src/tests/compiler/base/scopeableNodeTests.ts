import {expect} from "chai";
import {ScopeableNode, ClassDeclaration, Scope} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ScopeableNode), () => {
    function getFirstParameter(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return {...result, firstParam: result.firstChild.getConstructor()!.getParameters()[0]};
    }

    describe(nameof<ScopeableNode>(d => d.getScope), () => {
        it("should return undefined when there's no scope", () => {
            const {firstParam} = getFirstParameter("class Identifier { constructor(param: string) {} }");
            expect(firstParam.getScope()).to.be.undefined;
        });

        it("should return public when public", () => {
            const {firstParam} = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Public);
        });

        it("should return protected when protected", () => {
            const {firstParam} = getFirstParameter("class Identifier { constructor(protected param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Protected);
        });

        it("should return private when private", () => {
            const {firstParam} = getFirstParameter("class Identifier { constructor(private param: string) {} }");
            expect(firstParam.getScope()).to.equal(Scope.Private);
        });
    });

    describe(nameof<ScopeableNode>(d => d.setScope), () => {
        it("should set to public when set to public", () => {
            const {firstChild, firstParam} = getFirstParameter("class Identifier { constructor(param: string) {} }");
            firstParam.setScope(Scope.Public);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(public param: string) {} }");
        });

        it("should set to protected when set to protected", () => {
            const {firstChild, firstParam} = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            firstParam.setScope(Scope.Protected);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(protected param: string) {} }");
        });

        it("should set to private when set to private", () => {
            const {firstChild, firstParam} = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            firstParam.setScope(Scope.Private);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(private param: string) {} }");
        });

        it("should clear when set to undefined", () => {
            const {firstChild, firstParam} = getFirstParameter("class Identifier { constructor(public param: string) {} }");
            firstParam.setScope(undefined);
            expect(firstChild.getText()).to.be.equal("class Identifier { constructor(param: string) {} }");
        });
    });
});
