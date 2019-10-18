import { ts, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CommentNodeParser, ContainerNodes, isComment } from "../../../../compiler/ast/utils";
describe(nameof(CommentNodeParser), () => {
    function createSourceFile(text: string) {
        return ts.createSourceFile("test.ts", text, ts.ScriptTarget.Latest, false);
    }

    function assertEqual(
        expectedNodes: { kind: SyntaxKind; pos: number; end: number; }[],
        actualNodes: { kind: SyntaxKind; pos: number; end: number; }[],
        message?: string
    ) {
        expect(actualNodes.map(n => ({ kind: n.kind, pos: n.pos, end: n.end }))).to.deep.equal(expectedNodes, message);
    }

    function getBlock(sourceFile: ts.SourceFile) {
        return ts.forEachChild(sourceFile, c => ts.forEachChild(c, g => ts.isModuleBlock(g) || ts.isBlock(g) ? g : undefined))!;
    }

    describe("statemented tests", () => {
        function doStatementedTests(text: string, expectedNodes: { kind: SyntaxKind; pos: number; end: number; }[]) {
            // source file
            {
                const sourceFile = createSourceFile(text);
                const result = CommentNodeParser.getOrParseChildren(sourceFile, sourceFile);
                assertEqual(expectedNodes, result, "for source files");
            }
            // namespaces
            doForLeadingText("namespace T {\n", "for namespaces");
            // functions
            doForLeadingText("function f() {\n", "for functions");

            function doForLeadingText(leadingText: string, message: string) {
                const sourceFile = createSourceFile(leadingText + text + "\n}");
                const block = getBlock(sourceFile);
                const result = CommentNodeParser.getOrParseChildren(block, sourceFile);
                const adjustedExpectedNodes = expectedNodes.map(n => ({
                    kind: n.kind,
                    pos: (n.pos === 0 && !isComment(n) ? leadingText.length - 1 : leadingText.length) + n.pos,
                    end: n.end + leadingText.length
                }));
                assertEqual(adjustedExpectedNodes, result, message);
            }
        }

        it("should get single line comments that are before and after on a separate line", () => {
            doStatementedTests("// a\nlet a;\n//b", [{
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 0,
                end: 4
            }, {
                kind: ts.SyntaxKind.VariableStatement,
                pos: 0,
                end: 11
            }, {
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 12,
                end: 15
            }]);
        });

        it("should get triple slash comments", () => {
            doStatementedTests("/// a\n", [{
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 0,
                end: 5
            }]);
        });

        it("should get multi-line comments that are before and after on a separate line", () => {
            doStatementedTests("/*a*/\nlet a;\n/*b*/", [{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 0,
                end: 5
            }, {
                kind: ts.SyntaxKind.VariableStatement,
                pos: 0,
                end: 12
            }, {
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 13,
                end: 18
            }]);
        });

        it("should not get comments on the same line (leading nor trailing)", () => {
            doStatementedTests("/* a */let a; /* b */ // c", [{
                kind: ts.SyntaxKind.VariableStatement,
                pos: 0,
                end: 13
            }]);
        });

        it("multi-line comment should be considered leading when ends on same line", () => {
            doStatementedTests("/*\na\n*/let a;", [{
                kind: ts.SyntaxKind.VariableStatement,
                pos: 0,
                end: 13
            }]);
        });

        it("should ignore comments between nodes on the same line", () => {
            doStatementedTests("/*a*/let a;/*b*/let b;", [{
                kind: ts.SyntaxKind.VariableStatement,
                pos: 0,
                end: 11
            }, {
                kind: ts.SyntaxKind.VariableStatement,
                pos: 11,
                end: 22
            }]);
        });

        it("should not mistake a regex literal as a comment", () => {
            doStatementedTests("/t/g;let t;", [{
                kind: ts.SyntaxKind.ExpressionStatement,
                pos: 0,
                end: 5
            }, {
                kind: ts.SyntaxKind.VariableStatement,
                pos: 5,
                end: 11
            }]);
        });

        it("should only get the first comment on a line", () => {
            const text = `/*a*/ //b\n/*c*//*d*/ //e`;
            doStatementedTests(text, [{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 0,
                end: 5
            }, {
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 10,
                end: 15
            }]);
        });

        it("should not get a multi-line comment on the last line that has a preceeding token", () => {
            const sourceFile = createSourceFile("t; /*1*/");
            const result = CommentNodeParser.getOrParseChildren(sourceFile, sourceFile);
            assertEqual([{
                kind: ts.SyntaxKind.ExpressionStatement,
                pos: 0,
                end: 2
            }], result);
        });

        it("should get a multi-line comment on the same line as the last close brace", () => {
            const sourceFile = createSourceFile("function f() {\n/*1*/}");
            const result = CommentNodeParser.getOrParseChildren(getBlock(sourceFile), sourceFile);
            assertEqual([{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 15,
                end: 20
            }], result);
        });

        it("should not get a multi-line comment on the same line as the last close brace that has a preceeding token", () => {
            const sourceFile = createSourceFile("function f() {\nt;/*1*/}");
            const result = CommentNodeParser.getOrParseChildren(getBlock(sourceFile), sourceFile);
            assertEqual([{
                kind: ts.SyntaxKind.ExpressionStatement,
                pos: 14,
                end: 17
            }], result);
        });

        describe("js docs", () => {
            it("should not get js docs when there is a node below", () => {
                doStatementedTests("/** a */\nlet a;", [{
                    kind: ts.SyntaxKind.VariableStatement,
                    pos: 0,
                    end: 15
                }]);
            });

            it("should get js docs when there are no nodes", () => {
                doStatementedTests("/** a */", [{
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: 0,
                    end: 8
                }]);
            });

            it("should get js docs when there are no nodes below", () => {
                doStatementedTests("let a;\n/** a */", [{
                    kind: ts.SyntaxKind.VariableStatement,
                    pos: 0,
                    end: 6
                }, {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: 7,
                    end: 15
                }]);
            });
        });
    });

    describe("member tests", () => {
        function doTest(text: string, expectedNodes: { kind: SyntaxKind; pos: number; end: number; }[]) {
            const sourceFile = createSourceFile(text);
            const container = getContainer(sourceFile)!;
            const result = CommentNodeParser.getOrParseChildren(container, sourceFile);

            assertEqual(expectedNodes, result);

            function getContainer(node: ts.Node): ContainerNodes | undefined {
                if (ts.isClassDeclaration(node)
                    || ts.isEnumDeclaration(node)
                    || ts.isInterfaceDeclaration(node)
                    || ts.isClassExpression(node)
                    || ts.isTypeLiteralNode(node)
                    || ts.isObjectLiteralExpression(node)
                    || ts.isCaseClause(node)
                    || ts.isDefaultClause(node))
                {
                    return node;
                }

                return ts.forEachChild(node, getContainer);
            }
        }

        it("should not get comments on the same line", () => {
            doTest("class c {\n/*a*/p;/*b*/ //c\n}", [{
                kind: ts.SyntaxKind.PropertyDeclaration,
                pos: 9,
                end: 17
            }]);
        });

        it("should ignore comments that are on the opening brace", () => {
            doTest("interface i { // test\np;\n }", [{
                kind: ts.SyntaxKind.PropertySignature,
                pos: 13,
                end: 24
            }]);
        });

        it("should get comments on a different line", () => {
            doTest("enum e {\n/*a*/\na/*b*/\n//c\n}", [{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 9,
                end: 14
            }, {
                kind: ts.SyntaxKind.EnumMember,
                pos: 8,
                end: 16
            }, {
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 22,
                end: 25
            }]);
        });

        it("should handle only comments", () => {
            doTest("const c = class {\n//c\n};", [{
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 18,
                end: 21
            }]);
        });

        it("should include jsdocs when only jsdocs", () => {
            doTest("type t = {\n/**a*/\n};", [{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 11,
                end: 17
            }]);
        });

        it("should include jsdocs after last nodes", () => {
            doTest("const o = {\nprop: 5\n/**a*/\n};", [{
                kind: ts.SyntaxKind.PropertyAssignment,
                pos: 11,
                end: 19
            }, {
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: 20,
                end: 26
            }]);
        });

        it("should include comment after last nodes in object literal expression when it ends with a comma", () => {
            // there was a bug where it wasn't picking this up
            doTest("const o = {\nprop: 5,\n// 1\n};", [{
                kind: ts.SyntaxKind.PropertyAssignment,
                pos: 11,
                end: 19
            }, {
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 21,
                end: 25
            }]);
        });

        it("should include comments in case clause", () => {
            doTest("switch (a) {\ncase 5:\n//a\n}", [{
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 21,
                end: 24
            }]);
        });

        it("should not include comments in case clause with a block", () => {
            doTest("switch (a) {\ncase 5: {\n//a\n}}", [{
                kind: ts.SyntaxKind.Block,
                pos: 20,
                end: 28
            }]);
        });

        it("should include comments in default clause", () => {
            doTest("switch (a) {\ndefault:\n//a\n}", [{
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                pos: 22,
                end: 25
            }]);
        });

        it("should not include comments in default clause with a block", () => {
            doTest("switch (a) {\ndefault: {\n//a\n}}", [{
                kind: ts.SyntaxKind.Block,
                pos: 21,
                end: 29
            }]);
        });
    });
});
