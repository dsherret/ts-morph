import { expect } from "chai";
import { SpreadAssignment, Node, ObjectLiteralExpression } from "../../../../compiler";
import { SpreadAssignmentStructure } from "../../../../structures";
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

    describe(nameof<SpreadAssignment>(p => p.getStructure), () => {
        function test(code: string, expectedStructure: MakeRequired<SpreadAssignmentStructure>) {
            const { descendant } = getInfoFromTextWithDescendant<SpreadAssignment>(code, SyntaxKind.SpreadAssignment);
            expect(descendant.getStructure()).to.deep.equals(expectedStructure);
        }

        it("should get the structure", () => {
            test("const t = { ...assignment };", { expression: "assignment" });
        });
    });

    describe(nameof<SpreadAssignment>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: MakeRequired<SpreadAssignmentStructure>) {
            const { descendant } = getInfoFromTextWithDescendant<SpreadAssignment>(text, SyntaxKind.SpreadAssignment);
            const structure = descendant.getStructure();
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get", () => {
            doTest("const t = { ...assignment };", {
                expression: "assignment"
            });
        });
    });
});
