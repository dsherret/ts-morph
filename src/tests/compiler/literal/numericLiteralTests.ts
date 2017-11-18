import {expect} from "chai";
import {InterfaceDeclaration, NumericLiteral} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithFirstInterfaceProperty(text: string) {
    const obj = getInfoFromText<InterfaceDeclaration>(text);
    const firstProp = obj.firstChild.getProperties()[0];
    return { ...obj, firstProp };
}

describe(nameof(NumericLiteral), () => {
    describe(nameof<NumericLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: number) {
            const {firstProp} = getInfoFromTextWithFirstInterfaceProperty(text);
            const literal = (firstProp.getNameNode() as NumericLiteral);
            expect(literal.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("interface MyInterface { 5: string; }", 5);
        });

        it("should get the correct literal value when a decimal value", () => {
            doTest("interface MyInterface { 5.5: string; }", 5.5);
        });
    });
});
