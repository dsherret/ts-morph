import {expect} from "chai";
import {ts, SyntaxKind} from "./../../../../typescript";
import {SpreadAssignment} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(SpreadAssignment), () => {
    function getSpreadAssignment(text: string) {
        const opts = getInfoFromText(text);
        const spreadAssignment = opts.sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.SpreadAssignment) as SpreadAssignment;
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
});
