import {expect} from "chai";
import * as ts from "typescript";
import {DocumentationableNode, VariableStatement, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(DocumentationableNode), () => {
    describe(nameof(VariableStatement), () => {
        const {sourceFile} = getInfoFromText("/** Text */\nvar docedComment;\n/** First */\n/** Second */var multiCommented;\nvar nonDocedComment;");
        const statements = sourceFile.getVariableStatements();
        const docedStatement = statements[0];
        const multiDocedStatement = statements[1];
        const nonDocedStatement = statements[2];

        describe(nameof<DocumentationableNode>(n => n.getDocumentationComment), () => {
            describe("documentationed node", () => {
                it("should get the comment", () => {
                    expect(docedStatement.getDocumentationComment()).to.equal("Text");
                });
            });

            describe("multi-documentationed node", () => {
                it("should get the comment separated by newlines", () => {
                    expect(multiDocedStatement.getDocumentationComment()).to.equal("First\nSecond");
                });
            });

            describe("not documentationed node", () => {
                it("should return undefined", () => {
                    expect(nonDocedStatement.getDocumentationComment()).to.be.undefined;
                });
            });
        });

        describe(nameof<DocumentationableNode>(n => n.getDocumentationCommentNodes), () => {
            describe("documentationed node", () => {
                const nodes = docedStatement.getDocumentationCommentNodes();
                it("should have the right number of nodes", () => {
                    expect(nodes.length).to.equal(1);
                });

                it("should have the right node", () => {
                    expect(nodes[0].getText()).to.equal("/** Text */");
                });

                it("should have the right node kind", () => {
                    expect(nodes[0].getKind()).to.equal(ts.SyntaxKind.JSDocComment);
                });
            });

            describe("multi documentationed node", () => {
                it("should have the right number of nodes", () => {
                    expect(multiDocedStatement.getDocumentationCommentNodes().length).to.equal(2);
                });
            });

            describe("not documentationed node", () => {
                it("should not have any doc comment nodes", () => {
                    expect(nonDocedStatement.getDocumentationCommentNodes().length).to.equal(0);
                });
            });
        });
    });

    describe(nameof(FunctionDeclaration), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("/**\n * Test.\n * @name - Test\n */\nfunction myFunction(name: string) {}");
        const doc = firstChild.getDocumentationCommentNodes()[0];

        it("should have the right node kind", () => {
            expect(doc.getKind()).to.equal(ts.SyntaxKind.JSDocComment);
        });
    });
});
