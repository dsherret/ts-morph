import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { getInfoFromText } from "../../compiler/testHelpers";
import { Block } from "../../../compiler";

describe("doManipulation", () => {
    it("should display the syntactic diagnostics if the user inserts a syntax error", () => {
        const { sourceFile } = getInfoFromText("if (true) {\n}");
        const ifStatement = sourceFile.getStatementByKindOrThrow(SyntaxKind.IfStatement);
        const body = ifStatement.getThenStatement() as Block;
        let foundErr: any;
        try {
            body.addStatements("testing {");
        } catch (err) {
            foundErr = err;
        }

        // don't bother with the rest because it will change between ts versions...
        const expectedText = `Manipulation error: A syntax error was inserted.`;
        const message: string = foundErr.message;
        expect(message.replace(/\u001b\[[0-9][0-9]?m/g, "").substring(0, expectedText.length)).to.equal(expectedText);
    });
});
