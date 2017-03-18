import {expect} from "chai";
import {StatementedNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(StatementedNode), () => {
    const {sourceFile: variablesSourceFile} = getInfoFromText("var myVar;\nvar myVar1, myVar2;");

    describe(nameof<StatementedNode>(n => n.getVariableStatements), () => {
        describe("gets the variable declaration statements in a file", () => {
            const statements = variablesSourceFile.getVariableStatements();
            it("should have the expected number of statements", () => {
                expect(statements.length).to.equal(2);
            });
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclarationLists), () => {
        describe("gets the variable declaration lists in a file", () => {
            const declarationLists = variablesSourceFile.getVariableDeclarationLists();
            it("should have the expected number of variable declaration lists", () => {
                expect(declarationLists.length).to.equal(2);
            });
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclarations), () => {
        describe("gets the variable declarations in a file", () => {
            const declarations = variablesSourceFile.getVariableDeclarations();
            it("should have the expected number of variable declarations", () => {
                expect(declarations.length).to.equal(3);
            });
        });
    });
});
