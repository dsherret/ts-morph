import { expect } from "chai";
import { SpreadAssignment, Node, ObjectLiteralExpression } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";
import { TypeGuards } from "../../../../utils/TypeGuards";

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
        function doTest(code: string, index: number, expectedCode: string) {
            const { sourceFile, descendant } = getInfoFromTextWithDescendant<ObjectLiteralExpression>(code,
                SyntaxKind.ObjectLiteralExpression);

            descendant.getProperties()[index].remove();
            expect(descendant.getText()).to.equal(expectedCode);
        }

        it("should remove the first", () => {
            doTest("const t = { ...prop1, ...prop2 };", 0, "{ ...prop2 }");
        });

        it("should remove in the middle", () => {
            doTest("const t = { ...prop1, ...prop2, };", 1, "{ ...prop1 }");
        });

        it("should remove the last", () => {
            doTest("const t = { ...prop1, ...prop2, ...prop3 };", 2,
                "{ ...prop1, ...prop2 }");
        });

        it("should remove the first when on separate lines", () => {
            doTest(`const t = {\n    ...prop1,\n    ...prop2,\n    ...prop3\n};`, 0,
                `{\n    ...prop2,\n    ...prop3\n}`);
        });

        it("should remove in the middle when on separate lines", () => {
            doTest(`const t = {\n    ...prop1,\n    ...prop2,\n    ...prop3\n};`, 1,
                `{\n    ...prop1,\n    ...prop3\n}`);
        });

        it("should remove the last when on separate lines", () => {
            doTest(`const t = {\n    ...prop1,\n    ...prop2,\n    ...prop3\n};`, 2,
                `{\n    ...prop1,\n    ...prop2\n}`);
        });
    });
});
