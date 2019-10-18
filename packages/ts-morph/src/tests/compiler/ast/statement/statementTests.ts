import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { Statement } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(Statement), () => {
    describe(nameof<Statement>(n => n.remove), () => {
        function doVariableStatementTest(text: string, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const statement = sourceFile.getVariableStatementOrThrow("foo");
            statement.remove();
            expect(sourceFile.getFullText()).to.equals(expectedText);
        }

        it("should remove the statement from its sourcefile", () => {
            doVariableStatementTest(`const foo = 1; const bar = 2;`, `const bar = 2;`);
        });

        it("should remove comments on the same line", () => {
            doVariableStatementTest(`/* test */ const foo = 1; // other\nconst bar = 2;\n`, `const bar = 2;\n`);
        });

        it("should remove leading and trailing comments on the same line even if another node is on the same line", () => {
            // not worth handling this scenario any better
            doVariableStatementTest(`/* test */ const foo = 1; /*b*/ const bar = 2;\n`, `const bar = 2;\n`);
        });

        it("should not remove any comments on the line before", () => {
            doVariableStatementTest(`/* test */ // test\nconst foo = 1;\n`, `/* test */ // test\n`);
        });

        it("should not remove any comments on the line after", () => {
            doVariableStatementTest(`const foo = 1;\n/* test */ // test\n`, `/* test */ // test\n`);
        });

        function doCommentTest(text: string, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const statement = sourceFile.getStatementsWithComments()
                .find(s => s.getKind() === SyntaxKind.SingleLineCommentTrivia || s.getKind() === SyntaxKind.MultiLineCommentTrivia)!;
            statement.remove();
            expect(sourceFile.getFullText()).to.equals(expectedText);
            expect(statement.wasForgotten()).to.be.true;
        }

        it("should remove the single line comment", () => {
            doCommentTest(`// test\nlet t;`, `let t;`);
        });

        it("should remove the multi line comment", () => {
            doCommentTest(`/* test\n */\nlet t;`, `let t;`);
        });

        it("should remove the multi line comment's trailing trivia", () => {
            doCommentTest(`/* test\n */ // test\nlet t;`, `let t;`);
        });
    });
});
