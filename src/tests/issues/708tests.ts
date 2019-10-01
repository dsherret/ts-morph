import { expect } from "chai";
import { Project } from "../../Project";
import { IfStatement } from "../../compiler";
import { TypeGuards } from "../../utils/TypeGuards";

describe("tests for issue #706", () => {
    it.skip("should not error when removing a else if", () => {
        const project = new Project({ useVirtualFileSystem: true });
        const file = project.createSourceFile("test.ts", `if (true) {
    statement;
} else if (true) {
    statement;
}`);
        const ifStatement = (file.getStatements()[0] as IfStatement);
        const elseStatement = ifStatement.getElseStatement()!;
        elseStatement.remove();

        expect(file.getFullText()).to.equal(`if (true) {
    statement;
}`);
    });


    it("should not error", () => {
        const project = new Project({ useVirtualFileSystem: true });
        const file = project.createSourceFile("test.ts", `// comment1

if (true) {
} // comment2

test;`);

        const ifStatement = file.getStatementOrThrow(TypeGuards.isIfStatement);
        ifStatement.remove();
    })
});
