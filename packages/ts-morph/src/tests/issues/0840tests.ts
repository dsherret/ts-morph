import { expect } from "chai";
import { ClassExpression, ReturnStatement } from "../../compiler";
import { Project } from "../../Project";

describe("tests for issue #840", () => {
    it("should rename anonymous class expression with extends", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/file.ts", `return class extends A {}`);
        const returnStatement = sourceFile.getStatements()[0] as ReturnStatement;
        (returnStatement.getExpressionOrThrow() as ClassExpression).rename("C");
        expect(sourceFile.getFullText()).to.equal(`return class C extends A {}`);
    });

    it("should rename class decl with extends and no name", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/file.ts", `class extends A {}`);
        const classDec = sourceFile.getClasses()[0];
        classDec.rename("C");
        expect(sourceFile.getFullText()).to.equal(`class C extends A {}`);
    });
});
