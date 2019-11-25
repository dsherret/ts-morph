import { expect } from "chai";
import { Project } from "../../Project";
import { IfStatement, Node } from "../../compiler";
describe("tests for issue #706", () => {
    it("should not error when removing a else if", () => {
        const project = new Project({ useInMemoryFileSystem: true });
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

    it("should not error when removing node with trailing trivia", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const file = project.createSourceFile("test.ts", `// comment1

if (true) {
} // comment2

test;`);

        const ifStatement = file.getStatementOrThrow(Node.isIfStatement);
        ifStatement.remove();
    });

    it("should support removing an if block via a transform", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const file = project.createSourceFile("test.ts", `if (true) {
} else if (false) {
}`);
        const ifStatement = file.getStatementOrThrow(Node.isIfStatement);
        ifStatement.transform(() => {
            return ifStatement.compilerNode.elseStatement!;
        });
        expect(file.getFullText()).to.equal(`if (false) {
}`);
    });
});
