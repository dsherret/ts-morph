import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #867", () => {
    it("should not throw getting arguments for new expression without parens", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/file.ts", `new Object;`);
        const newExpression = sourceFile.getStatementByKindOrThrow(SyntaxKind.ExpressionStatement)
            .getExpressionIfKindOrThrow(SyntaxKind.NewExpression);

        expect(newExpression.getArguments().length).to.equal(0);
    });

    it("should add parentheses when there are none", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/file.ts", `new Object;`);
        const newExpression = sourceFile.getStatementByKindOrThrow(SyntaxKind.ExpressionStatement)
            .getExpressionIfKindOrThrow(SyntaxKind.NewExpression);

        newExpression.addArgument("test");
        expect(sourceFile.getText()).to.equal("new Object(test);");
    });
});
