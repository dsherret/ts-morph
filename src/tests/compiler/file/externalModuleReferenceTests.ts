import {expect} from "chai";
import * as ts from "typescript";
import {ExternalModuleReference} from "./../../../compiler";
import * as errors from "./../../../errors";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

describe(nameof(ExternalModuleReference), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ExternalModuleReference>(text, ts.SyntaxKind.ExternalModuleReference);
    }

    // I'm not sure how to make expression null

    describe(nameof<ExternalModuleReference>(n => n.getExpression), () => {
        it("should get the expression", () => {
            const {descendant} = getNode("import test = require('expression');");
            expect(descendant.getExpression()!.getText()).to.equal("'expression'");
        });
    });

    describe(nameof<ExternalModuleReference>(n => n.getExpressionOrThrow), () => {
        it("should get the expression", () => {
            const {descendant} = getNode("import test = require('expression');");
            expect(descendant.getExpressionOrThrow().getText()).to.equal("'expression'");
        });
    });
});
