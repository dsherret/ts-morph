import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CaseBlock } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

function getCaseBlock(text: string) {
    const obj = getInfoFromText(text);
    const caseBlock = (obj.sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.CaseBlock)) as CaseBlock;
    return { ...obj, caseBlock };
}

describe(nameof(CaseBlock), () => {
    const firstCase = "case 1: x = 1; break;";
    const secondCase = "case 2: x = 2; break;";
    const thirdCase = "case 3: x = 3; break;";
    const fourthCase = "case 4: x = 4; break;";
    const defaultCase = "default: x = 3; break;";

    function makeSwitch(clauses: string[]) {
        return `switch (x) {\n    ${clauses.join("\n    ")}\n}`;
    }

    const switchStatement = makeSwitch([firstCase, secondCase, defaultCase]);
    describe(nameof<CaseBlock>(s => s.getClauses), () => {
        function doTest(code: string, clauses: string[]) {
            const { caseBlock } = getCaseBlock(code);
            expect(caseBlock.getClauses().map(s => s.getText())).to.deep.equal(clauses);
        }

        it("should get clauses of a case block", () => {
            doTest(switchStatement, [firstCase, secondCase, defaultCase]);
        });
    });

    describe(nameof<CaseBlock>(s => s.removeClauses), () => {
        function doTest(code: string, range: [number, number], expectedCode: string) {
            const { sourceFile, caseBlock } = getCaseBlock(code);
            const nodes = caseBlock.removeClauses(range);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove clauses at the beginning of a case block", () => {
            doTest(switchStatement, [0, 1], makeSwitch([defaultCase]));
        });

        it("should remove clauses in the middle of a case block", () => {
            doTest(switchStatement, [1, 1], makeSwitch([firstCase, defaultCase]));
        });

        it("should remove clauses at the end case block", () => {
            doTest(switchStatement, [1, 2], makeSwitch([firstCase]));
        });
    });

    describe(nameof<CaseBlock>(s => s.removeClause), () => {
        function doTest(code: string, index: number, expectedCode: string) {
            const { sourceFile, caseBlock } = getCaseBlock(code);
            caseBlock.removeClause(index);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when specifying an invalid index", () => {
            const { caseBlock } = getCaseBlock(switchStatement);
            expect(() => caseBlock.removeClause(5)).to.throw();
        });

        it("should remove at the specified index", () => {
            doTest(switchStatement, 1, makeSwitch([firstCase, defaultCase]));
        });
    });
});
