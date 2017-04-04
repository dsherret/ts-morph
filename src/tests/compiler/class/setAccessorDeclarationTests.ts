import * as ts from "typescript";
import {expect} from "chai";
import {ClassDeclaration, SetAccessorDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getSetAccessorInfo(text: string) {
    const result = getInfoFromText<ClassDeclaration>(text);
    const setAccessor = result.firstChild.getInstanceProperties().find(f => f.getKind() === ts.SyntaxKind.SetAccessor) as SetAccessorDeclaration;
    return {...result, setAccessor};
}

describe(nameof(SetAccessorDeclaration), () => {
    describe(nameof<SetAccessorDeclaration>(d => d.getGetAccessor), () => {
        it("should return undefined if no corresponding set accessor exists", () => {
            const {setAccessor} = getSetAccessorInfo(`class Identifier { set identifier(val: string) {} }`);
            expect(setAccessor.getGetAccessor()).to.be.undefined;
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const {setAccessor} = getSetAccessorInfo(code);
            expect(setAccessor.getGetAccessor()!.getText()).to.equal(`get identifier() { return ""; }`);
        });
    });
});
