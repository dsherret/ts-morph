import { expect } from "chai";
import { SpreadAssignment, Node, ObjectLiteralExpression } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";
import { TypeGuards } from "../../../../utils/TypeGuards";
import { doTestForRemove } from "./propertyAssignmentTests";

describe(nameof(SpreadAssignment), () => {
    function getSpreadAssignment(text: string) {
        const opts = getInfoFromText(text);
        const spreadAssignment = opts.sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.SpreadAssignment);
        return {
            spreadAssignment,
            ...opts
        };
    }

    describe(nameof<SpreadAssignment>(a => a.getExpression), () => {
        it("should get the spread assignment expression", () => {
            const {spreadAssignment} = getSpreadAssignment("const t = { ...obj }");
            expect(spreadAssignment.getExpression().getText()).to.equal("obj");
        });
    });

    describe(nameof<SpreadAssignment>(p => p.remove), () => {
        it("should remove ShorthandPropertyAssignment", () => {
            doTestForRemove("const prop2 = 2; const t = { prop1: {prop1: 2}, prop2, foo: {bar: '98989'} };", "prop2",
                "{ prop1: {prop1: 2}, foo: {bar: '98989'} }");
        });

        it("should remove SpreadAssignment", () => {
            doTestForRemove("const t = { prop1: {prop1: 2}, ... {a: 2}, foo: {bar: '98989'} };", TypeGuards.isSpreadAssignment,
                "{ prop1: {prop1: 2}, foo: {bar: '98989'} }");
        });
    });

});
