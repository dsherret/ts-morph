import {expect} from "chai";
import {AmbientableNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(AmbientableNode), () => {
    const {sourceFile} = getInfoFromText("declare var ambientedVar; var myExplicitVar: string;");
    const statements = sourceFile.getVariableStatements();
    const ambientedStatement = statements[0];
    const notAmbientedStatement = statements[1];

    describe(nameof<AmbientableNode>(n => n.hasDeclareKeyword), () => {
        describe("ambientable node", () => {
            it("should have an declare keyword", () => {
                expect(ambientedStatement.hasDeclareKeyword()).to.be.true;
            });
        });

        describe("not ambiented node", () => {
            it("should not have an declare keyword", () => {
                expect(notAmbientedStatement.hasDeclareKeyword()).to.be.false;
            });
        });
    });

    describe(nameof<AmbientableNode>(n => n.getDeclareKeyword), () => {
        describe("ambientable node", () => {
            it("should have an declare keyword", () => {
                expect(ambientedStatement.getDeclareKeyword()!.getText()).to.equal("declare");
            });
        });

        describe("not ambiented node", () => {
            it("should not have an declare keyword", () => {
                expect(notAmbientedStatement.getDeclareKeyword()).to.be.undefined;
            });
        });
    });
});
