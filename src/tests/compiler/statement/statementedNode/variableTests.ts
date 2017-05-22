import {expect} from "chai";
import {StatementedNode, VariableStatement, VariableDeclarationList, VariableDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    const {sourceFile: variablesSourceFile} = getInfoFromText("var Identifier1;\nvar Identifier2, Identifier3;");
    describe(nameof<StatementedNode>(n => n.getVariableStatements), () => {
        const statements = variablesSourceFile.getVariableStatements();
        it("should have the expected number of statements", () => {
            expect(statements.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(statements[0]).to.be.instanceOf(VariableStatement);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableStatement), () => {
        it("should get a variable statement when something matches", () => {
            const statement = variablesSourceFile.getVariableStatement(s => s.getDeclarationList().getDeclarations().length === 2)!;
            expect(statement.getDeclarationList().getDeclarations()[0].getName()).to.equal("Identifier2");
        });

        it("should return undefined when nothing matches", () => {
            const statement = variablesSourceFile.getVariableStatement(s => s.getDeclarationList().getDeclarations().length === 5);
            expect(statement).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclarationLists), () => {
        const declarationLists = variablesSourceFile.getVariableDeclarationLists();
        it("should have the expected number of variable declaration lists", () => {
            expect(declarationLists.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(declarationLists[0]).to.be.instanceOf(VariableDeclarationList);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclarationList), () => {
        it("should get a variable declaration list when something matches", () => {
            const list = variablesSourceFile.getVariableDeclarationList(s => s.getDeclarations().length === 2)!;
            expect(list.getDeclarations()[0].getName()).to.equal("Identifier2");
        });

        it("should return undefined when nothing matches", () => {
            const list = variablesSourceFile.getVariableDeclarationList(s => s.getDeclarations().length === 5);
            expect(list).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclarations), () => {
        const declarations = variablesSourceFile.getVariableDeclarations();
        it("should have the expected number of variable declarations", () => {
            expect(declarations.length).to.equal(3);
        });

        it("should have correct type", () => {
            expect(declarations[0]).to.be.instanceOf(VariableDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclaration), () => {
        it("should get a variable declaration by a name", () => {
            expect(variablesSourceFile.getVariableDeclaration("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a variable declaration by a search function", () => {
            expect(variablesSourceFile.getVariableDeclaration(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the variable declaration doesn't exist", () => {
            expect(variablesSourceFile.getVariableDeclaration("asdf")).to.be.undefined;
        });
    });
});
