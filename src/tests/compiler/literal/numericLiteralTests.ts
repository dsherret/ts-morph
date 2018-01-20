import * as ts from "typescript";
import {expect} from "chai";
import {InterfaceDeclaration, NumericLiteral} from "./../../../compiler";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

describe(nameof(NumericLiteral), () => {
    describe(nameof<NumericLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: number) {
            const {descendant} = getInfoFromTextWithDescendant<NumericLiteral>(text, ts.SyntaxKind.NumericLiteral);
            expect(descendant.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("interface MyInterface { 5: string; }", 5);
        });

        it("should get the correct literal value when a decimal value", () => {
            doTest("interface MyInterface { 5.5: string; }", 5.5);
        });
    });
});
