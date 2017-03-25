import {expect} from "chai";
import {ScopedNode, ClassDeclaration, PropertyDeclaration, Scope} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

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
});
