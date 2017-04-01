import * as ts from "typescript";
import {expect} from "chai";
import {ClassDeclaration, GetAccessorDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getGetAccessorInfo(text: string) {
    const result = getInfoFromText<ClassDeclaration>(text);
    const getAccessor = result.firstChild.getInstanceProperties().filter(f => f.getKind() === ts.SyntaxKind.GetAccessor)[0] as GetAccessorDeclaration;
    return {...result, getAccessor};
}

describe(nameof(GetAccessorDeclaration), () => {
    describe(nameof<GetAccessorDeclaration>(d => d.getSetAccessor), () => {
        it("should return undefined if no corresponding get accessor exists", () => {
            const {getAccessor} = getGetAccessorInfo(`class Identifier { get identifier(): string { return "" } }`);
            expect(getAccessor.getSetAccessor()).to.be.undefined;
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const {getAccessor} = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessor()!.getText()).to.equal("set identifier(val: string) {}");
        });
    });
});
