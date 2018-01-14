import * as ts from "typescript";
import {expect} from "chai";
import {TypeGuards} from "./../../utils";
import {getInfoFromText} from "./../compiler/testHelpers";

describe(nameof(TypeGuards), () => {
    // most of the code in TypeGuards is not worth the effort to test... it's auto generated from code so it should be close to correct

    describe(nameof(TypeGuards.hasExpression), () => {
        it("should have an expression when it's a function call", () => {
            const {firstChild} = getInfoFromText("funcCall()");
            expect(TypeGuards.hasExpression(firstChild)).to.be.true;
            if (TypeGuards.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("funcCall()");
        });

        it("should not have an expression when it doesn't", () => {
            const {firstChild} = getInfoFromText("class Test {}");
            expect(TypeGuards.hasExpression(firstChild)).to.be.false;
        });

        it("should have an expression when it's a return statement with a value", () => {
            const {firstChild} = getInfoFromText("return 5;");
            expect(TypeGuards.hasExpression(firstChild)).to.be.true;
            if (TypeGuards.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("5");
        });

        it("should not have an expression when it's a return statement without a value", () => {
            const {firstChild} = getInfoFromText("return;");
            expect(TypeGuards.hasExpression(firstChild)).to.be.false;
        });
    });
});
