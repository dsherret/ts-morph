import { ts, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CommentNodeParser, ContainerNodes } from "../CommentNodeParser";
import { isComment } from "../isComment";
import { CompilerCommentList } from "../CompilerComments";

const commentListSyntaxKind = CompilerCommentList.kind;

describe(nameof(CommentNodeParser), () => {
    type Node = BaseNode | CommentList | Comment;
    interface BaseNode {
        kind: SyntaxKind;
        pos: number;
        end: number;
    }
    interface CommentList extends BaseNode {
        comments: Comment[];
    }
    interface Comment extends BaseNode {
    }

    function createSourceFile(text: string) {
        return ts.createSourceFile("test.ts", text, ts.ScriptTarget.Latest, false);
    }

    function assertEqual(
        expectedNodes: Node[],
        actualNodes: Node[],
        message?: string
    ) {
        expect(actualNodes.map(nodeForCompare)).to.deep.equal(
            expectedNodes,
            message
        );

        function nodeForCompare<T extends Node>(node: T): T {
            const obj: Node = { kind: node.kind, pos: node.pos, end: node.end };
            if ((node as CommentList).comments != null)
                (obj as CommentList).comments = (node as CommentList).comments.map(nodeForCompare);
            return obj as T;
        }
    }

    function getBlock(sourceFile: ts.SourceFile) {
        return ts.forEachChild(sourceFile, c => ts.forEachChild(c, g => ts.isModuleBlock(g) || ts.isBlock(g) ? g : undefined))!;
    }

    describe(nameof(CommentNodeParser.getOrParseChildren), () => {
        describe("statemented tests", () => {
            function doStatementedTests(text: string, expectedNodes: Node[]) {
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
                    const adjustedExpectedNodes = expectedNodes.map(adjustNode);
                    assertEqual(adjustedExpectedNodes, result, message);

                    function adjustNode<T extends Node>(node: T): T {
                        const adjustmentPos = node.pos === 0 && !isComment(node) && node.kind !== commentListSyntaxKind
                            ? leadingText.length - 1
                            : leadingText.length;
                        const obj: Node = {
                            kind: node.kind,
                            pos: adjustmentPos + node.pos,
                            end: node.end + leadingText.length
                        };
                        if ((node as CommentList).comments != null)
                            (obj as CommentList).comments = (node as CommentList).comments.map(adjustNode);
                        return obj as T;
                    }
                }
            }

            it("should get a lone comment with no newline after it", () => {
                doStatementedTests("//a", [{
                    kind: commentListSyntaxKind,
                    pos: 0,
                    end: 3,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 0,
                        end: 3
                    }]
                }]);
            });

            it("should get single line comments that are before and after on a separate line", () => {
                doStatementedTests("// a\nlet a;\n//b", [{
                    kind: commentListSyntaxKind,
                    pos: 0,
                    end: 4,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 0,
                        end: 4
                    }]
                }, {
                    kind: ts.SyntaxKind.VariableStatement,
                    pos: 0,
                    end: 11
                }, {
                    kind: commentListSyntaxKind,
                    pos: 12,
                    end: 15,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 12,
                        end: 15
                    }]
                }]);
            });

            it("should get triple slash comments", () => {
                doStatementedTests("/// a\n", [{
                    kind: commentListSyntaxKind,
                    pos: 0,
                    end: 5,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 0,
                        end: 5
                    }]
                }]);
            });

            it("should get multi-line comments that are before and after on a separate line", () => {
                doStatementedTests("/*a*/\nlet a;\n/*b*/", [{
                    kind: commentListSyntaxKind,
                    pos: 0,
                    end: 5,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 0,
                        end: 5
                    }]
                }, {
                    kind: ts.SyntaxKind.VariableStatement,
                    pos: 0,
                    end: 12
                }, {
                    kind: commentListSyntaxKind,
                    pos: 13,
                    end: 18,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 13,
                        end: 18
                    }]
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

            it("should get the comment lists and all the sub comments", () => {
                const text = `/*a*/ //b\n/*c*//*d*/ //e`;
                doStatementedTests(text, [{
                    kind: commentListSyntaxKind,
                    pos: 0,
                    end: 9,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 0,
                        end: 5
                    }, {
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 6,
                        end: 9
                    }]
                }, {
                    kind: commentListSyntaxKind,
                    pos: 10,
                    end: 24,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 10,
                        end: 15
                    }, {
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 15,
                        end: 20
                    }, {
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 21,
                        end: 24
                    }]
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
                    kind: commentListSyntaxKind,
                    pos: 15,
                    end: 20,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 15,
                        end: 20
                    }]
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
                        kind: commentListSyntaxKind,
                        pos: 0,
                        end: 8,
                        comments: [{
                            kind: ts.SyntaxKind.MultiLineCommentTrivia,
                            pos: 0,
                            end: 8
                        }]
                    }]);
                });

                it("should get js docs when there are no nodes below", () => {
                    doStatementedTests("let a;\n/** a */", [{
                        kind: ts.SyntaxKind.VariableStatement,
                        pos: 0,
                        end: 6
                    }, {
                        kind: commentListSyntaxKind,
                        pos: 7,
                        end: 15,
                        comments: [{
                            kind: ts.SyntaxKind.MultiLineCommentTrivia,
                            pos: 7,
                            end: 15
                        }]
                    }]);
                });
            });
        });

        describe("member tests", () => {
            function doTest(text: string, expectedNodes: Node[]) {
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
                    kind: commentListSyntaxKind,
                    pos: 9,
                    end: 14,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 9,
                        end: 14
                    }]
                }, {
                    kind: ts.SyntaxKind.EnumMember,
                    pos: 8,
                    end: 16
                }, {
                    kind: commentListSyntaxKind,
                    pos: 22,
                    end: 25,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 22,
                        end: 25
                    }]
                }]);
            });

            it("should handle only comments", () => {
                doTest("const c = class {\n//c\n};", [{
                    kind: commentListSyntaxKind,
                    pos: 18,
                    end: 21,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 18,
                        end: 21
                    }]
                }]);
            });

            it("should include jsdocs when only jsdocs", () => {
                doTest("type t = {\n/**a*/\n};", [{
                    kind: commentListSyntaxKind,
                    pos: 11,
                    end: 17,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 11,
                        end: 17
                    }]
                }]);
            });

            it("should include jsdocs after last nodes", () => {
                doTest("const o = {\nprop: 5\n/**a*/\n};", [{
                    kind: ts.SyntaxKind.PropertyAssignment,
                    pos: 11,
                    end: 19
                }, {
                    kind: commentListSyntaxKind,
                    pos: 20,
                    end: 26,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 20,
                        end: 26
                    }]
                }]);
            });

            it("should include comment after last nodes in object literal expression when it ends with a comma", () => {
                // there was a bug where it wasn't picking this up
                doTest("const o = {\nprop: 5,\n// 1\n};", [{
                    kind: ts.SyntaxKind.PropertyAssignment,
                    pos: 11,
                    end: 19
                }, {
                    kind: commentListSyntaxKind,
                    pos: 21,
                    end: 25,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 21,
                        end: 25
                    }]
                }]);
            });

            it("should ignore comment that follows a comma on the next line", () => {
                doTest("const o = {\nprop: 5\n    ,\n// 1\n};", [{
                    kind: ts.SyntaxKind.PropertyAssignment,
                    pos: 11,
                    end: 19
                }]);
            });

            it("should ignore comment that preceeds a comma on the next line", () => {
                doTest("const o = {\nprop: 5\n    /* 1 */,\n};", [{
                    kind: ts.SyntaxKind.PropertyAssignment,
                    pos: 11,
                    end: 19
                }]);
            });

            it("should include comments in case clause", () => {
                doTest("switch (a) {\ncase 5:\n//a\n}", [{
                    kind: commentListSyntaxKind,
                    pos: 21,
                    end: 24,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 21,
                        end: 24
                    }]
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
                    kind: commentListSyntaxKind,
                    pos: 22,
                    end: 25,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 22,
                        end: 25,
                    }]
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

    describe(nameof(CommentNodeParser.getOrParseTokens), () => {
        describe("general tests", () => {
            const sourceFile = createSourceFile("//2\nconst t;");
            const getTokens = () => CommentNodeParser.getOrParseTokens(sourceFile.getChildren(sourceFile)[0], sourceFile);
            // it should be the same reference
            expect(getTokens()).to.equal(getTokens());
        });

        describe("statemented tests", () => {
            function doStatementedTests(text: string, expectedNodes: Node[]) {
                // source file
                {
                    const sourceFile = createSourceFile(text);
                    const result = CommentNodeParser.getOrParseTokens(sourceFile.getChildren(sourceFile)[0], sourceFile);
                    assertEqual(expectedNodes, result, "for source files");
                }
                // namespaces
                doForLeadingText("namespace T {\n", "for namespaces");
                // functions
                doForLeadingText("function f() {\n", "for functions");

                function doForLeadingText(leadingText: string, message: string) {
                    const sourceFile = createSourceFile(leadingText + text + "\n}");
                    const block = getBlock(sourceFile);
                    const result = CommentNodeParser.getOrParseTokens(block.getChildren(sourceFile)[1], sourceFile);
                    const adjustedExpectedNodes = expectedNodes.map(adjustNode);
                    assertEqual(adjustedExpectedNodes, result, message);

                    function adjustNode<T extends Node>(node: T): T {
                        const adjustmentPos = node.pos === 0 && !isComment(node) && node.kind !== commentListSyntaxKind
                            ? leadingText.length - 1
                            : leadingText.length;
                        const obj: Node = {
                            kind: node.kind,
                            pos: adjustmentPos + node.pos,
                            end: node.end + leadingText.length
                        };
                        if ((node as CommentList).comments != null)
                            (obj as CommentList).comments = (node as CommentList).comments.map(adjustNode);
                        return obj as T;
                    }
                }
            }

            it("should get comments on the same line (leading and trailing)", () => {
                doStatementedTests("/*1*///1\n/*a*/let a/*ignore*/; /*b*/ //c\n//1", [{
                    kind: commentListSyntaxKind,
                    pos: 0,
                    end: 8,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 0,
                        end: 5
                    }, {
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 5,
                        end: 8
                    }]
                }, {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: 9,
                    end: 14
                }, {
                    kind: ts.SyntaxKind.VariableStatement,
                    pos: 0,
                    end: 30
                }, {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: 31,
                    end: 36
                }, {
                    kind: ts.SyntaxKind.SingleLineCommentTrivia,
                    pos: 37,
                    end: 40
                }, {
                    kind: commentListSyntaxKind,
                    pos: 41,
                    end: 44,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 41,
                        end: 44
                    }]
                }]);
            });

            it("should not get the comments between a js doc and the declaration—they're part of the declaration", () => {
                doStatementedTests("/** test */ //test\nfunction test() {}", [{
                    kind: ts.SyntaxKind.FunctionDeclaration,
                    pos: 0,
                    end: 37
                }]);
            });
        });

        describe("member tests", () => {
            function doTest(text: string, expectedNodes: Node[]) {
                const sourceFile = createSourceFile(text);
                const syntaxList = getContainer(sourceFile)!.getChildren(sourceFile).find(c => c.kind === ts.SyntaxKind.SyntaxList)!;
                const result = CommentNodeParser.getOrParseTokens(syntaxList, sourceFile);

                assertEqual(expectedNodes, result);

                function getContainer(node: ts.Node): ts.Node | undefined {
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

            it("should get all comments and ignore ones inside the inner declarations", () => {
                doTest("interface i{ //1\n//2\n/*3*/p/*ignore*/;/*4*///5\n//6\n/*7*/}", [{
                    kind: ts.SyntaxKind.SingleLineCommentTrivia,
                    pos: 13,
                    end: 16
                }, {
                    kind: commentListSyntaxKind,
                    pos: 17,
                    end: 20,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 17,
                        end: 20
                    }]
                }, {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: 21,
                    end: 26
                }, {
                    kind: ts.SyntaxKind.PropertySignature,
                    pos: 12,
                    end: 38
                }, {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: 38,
                    end: 43
                }, {
                    kind: ts.SyntaxKind.SingleLineCommentTrivia,
                    pos: 43,
                    end: 46
                }, {
                    kind: commentListSyntaxKind,
                    pos: 47,
                    end: 50,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 47,
                        end: 50
                    }]
                }, {
                    kind: commentListSyntaxKind,
                    pos: 51,
                    end: 56,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 51,
                        end: 56,
                    }]
                }]);
            });
        });

        describe("node tests", () => {
            function doTest(text: string, selectNode: (sourceFile: ts.SourceFile) => ts.Node, expectedNodes: Node[]) {
                const sourceFile = createSourceFile(text);
                const node = selectNode(sourceFile);
                const result = CommentNodeParser.getOrParseTokens(node, sourceFile);

                assertEqual(expectedNodes, result);
            }

            it("should get the comments after the first js doc for a declaration", () => {
                doTest("//1\n/**a*/ //2\nfunction f() /*3*/ {/*ignore*/} // ignore", file => file.statements[0], [{
                    kind: ts.SyntaxKind.JSDocComment,
                    pos: 4,
                    end: 10
                }, {
                    kind: ts.SyntaxKind.SingleLineCommentTrivia,
                    pos: 11,
                    end: 14
                }, {
                    kind: ts.SyntaxKind.FunctionKeyword,
                    pos: 0,
                    end: 23
                }, {
                    kind: ts.SyntaxKind.Identifier,
                    pos: 23,
                    end: 25
                }, {
                    kind: ts.SyntaxKind.OpenParenToken,
                    pos: 25,
                    end: 26
                }, {
                    kind: ts.SyntaxKind.SyntaxList,
                    pos: 26,
                    end: 26
                }, {
                    kind: ts.SyntaxKind.CloseParenToken,
                    pos: 26,
                    end: 27
                }, {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: 28,
                    end: 33
                }, {
                    kind: ts.SyntaxKind.Block,
                    pos: 27,
                    end: 46
                }]);
            });

            it("should only return the SyntaxList and EndOfFileToken for a source file", () => {
                doTest("//1\n", file => file, [{
                    kind: ts.SyntaxKind.SyntaxList,
                    pos: 0,
                    end: 0
                }, {
                    kind: ts.SyntaxKind.EndOfFileToken,
                    pos: 0,
                    end: 4
                }]);
            });

            it("should get the comments for a source file's syntax list", () => {
                doTest("//1\n/*2*///3\n/**4*/const t;\n//5", file => file.getChildren().find(c => c.kind === ts.SyntaxKind.SyntaxList)!, [{
                    kind: commentListSyntaxKind,
                    pos: 0,
                    end: 3,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 0,
                        end: 3
                    }]
                }, {
                    kind: commentListSyntaxKind,
                    pos: 4,
                    end: 12,
                    comments: [{
                        kind: ts.SyntaxKind.MultiLineCommentTrivia,
                        pos: 4,
                        end: 9
                    }, {
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 9,
                        end: 12
                    }]
                }, {
                    kind: ts.SyntaxKind.VariableStatement,
                    pos: 0,
                    end: 27
                }, {
                    kind: commentListSyntaxKind,
                    pos: 28,
                    end: 31,
                    comments: [{
                        kind: ts.SyntaxKind.SingleLineCommentTrivia,
                        pos: 28,
                        end: 31
                    }]
                }]);
            });
        });
    });
});
