import { expect } from "chai";
import { assert, IsExact, IsNullable } from "conditional-type-checks";
import { CodeBlockWriter } from "../../../../codeBlockWriter";
import { CallExpression, ClassDeclaration, EnumDeclaration, FormatCodeSettings, FunctionDeclaration, Identifier, InterfaceDeclaration, Node,
    PropertyAccessExpression, PropertySignature, SourceFile, TypeParameterDeclaration, ForEachDescendantTraversalControl, VariableStatement, ForStatement,
    ForOfStatement, ForInStatement, NumericLiteral, StringLiteral, ExpressionStatement, NodeParentType } from "../../../../compiler";
import { hasParsedTokens } from "../../../../compiler/ast/utils";
import { Project } from "../../../../Project";
import { errors, NewLineKind, SyntaxKind, ts, SymbolFlags } from "@ts-morph/common";
import { WriterFunction } from "../../../../types";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(Node), () => {
    describe("constructor", () => {
        it("should throw if constructing a node outside the library", () => {
            const ctor = Node as any;
            expect(() => new ctor()).to.throw(errors.InvalidOperationError);
        });

        it("should throw if constructing a node outside the library with other arguments", () => {
            const ctor = Node as any;
            expect(() => new ctor(1, 2, 3)).to.throw(errors.InvalidOperationError);
        });
    });

    describe(nameof<Node>(n => n.compilerNode), () => {
        it("should get the underlying compiler node", () => {
            const { sourceFile } = getInfoFromText("enum MyEnum {}\n");
            // just compare that the texts are the same
            expect(sourceFile.getFullText()).to.equal(sourceFile.compilerNode.getFullText());
        });

        it("should throw an error when using a removed node", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member }");
            const member = firstChild.getMembers()[0];
            member.remove();
            expect(() => member.compilerNode).to.throw(errors.InvalidOperationError, getExpectedForgottenMessage("member"));
        });

        it("should throw an error when using a removed node and trim the message's node text when it's sufficiently long", () => {
            const trimLength = 100;
            const nodeText = getTestNodeText();
            const { firstChild } = getInfoFromText<EnumDeclaration>(nodeText);
            firstChild.remove();
            expect(() => firstChild.compilerNode).to.throw(errors.InvalidOperationError, getExpectedForgottenMessage(nodeText.substr(0, trimLength) + "..."));

            function getTestNodeText() {
                let result = "enum MyEnum { ";
                while (result.length < trimLength)
                    result += `member, `;
                result += "}";
                return result;
            }
        });
    });

    describe(nameof<Node>(n => n.getKind), () => {
        it("should return the syntax kind", () => {
            const { firstChild } = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKind()).to.equal(SyntaxKind.EnumDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getKindName), () => {
        it("should return the syntax kind name", () => {
            const { firstChild } = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKindName()).to.equal("EnumDeclaration");
        });
    });

    describe(nameof<Node>(n => n.containsRange), () => {
        const { firstChild } = getInfoFromText("enum MyEnum {}");
        it("should contain the range when equal to the pos and end", () => {
            expect(firstChild.containsRange(firstChild.getPos(), firstChild.getEnd())).to.be.true;
        });

        it("should contain the range when inside", () => {
            expect(firstChild.containsRange(firstChild.getPos() + 1, firstChild.getEnd() - 1)).to.be.true;
        });

        it("should not contain the range when the position is outside", () => {
            expect(firstChild.containsRange(firstChild.getPos() - 1, firstChild.getEnd())).to.be.false;
        });

        it("should not contain the range when the end is outside", () => {
            expect(firstChild.containsRange(firstChild.getPos(), firstChild.getEnd() + 1)).to.be.false;
        });
    });

    describe(nameof<Node>(n => n.isInStringAtPos), () => {
        function doTest(text: string, isInStringAtPos: boolean[]) {
            expect(text.length + 1).to.equal(isInStringAtPos.length);
            const { sourceFile } = getInfoFromText(text);
            for (let i = 0; i < isInStringAtPos.length; i++)
                expect(sourceFile.isInStringAtPos(i)).to.equal(isInStringAtPos[i], `should be equal at index ${i}`);
        }

        it("should be within a double quote string when it is", () => {
            doTest(`"t"`, [false, true, false, false]);
        });

        it("should be within a single quote string when it is", () => {
            doTest(`'t'`, [false, true, false, false]);
        });

        it("should be within a mix of double and single quotes when it is", () => {
            doTest(`"t";'t'`, [false, true, false, false, false, true, false, false]);
        });

        it("should be within a tagged template string when it is", () => {
            doTest("`t${v}" + "t${u}t`", [
                false,
                true,
                true,
                false,
                false,
                false,
                true,
                true,
                false,
                false,
                false,
                true,
                false,
                false
            ]);
        });

        it("should throw when specifying a pos less than 0", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.isInStringAtPos(-1)).to.throw();
        });

        it("should throw when specifying a pos greater than the length of the file", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.isInStringAtPos(1)).to.throw();
        });

        it("should clear the list of cached nodes after manipulating", () => {
            const { sourceFile } = getInfoFromText(`"t"`);
            expect(sourceFile.isInStringAtPos(3)).to.be.false;
            sourceFile.replaceText([1, 1], "new text");
            expect(sourceFile.isInStringAtPos(3)).to.be.true;
        });
    });

    describe(nameof<Node>(n => n.getText), () => {
        it("should get without jsdoc text when not specifying to", () => {
            const { firstChild } = getInfoFromText("/**\n * Testing\n */\nclass MyClass {}");
            const expectedText = "class MyClass {}";
            expect(firstChild.getText()).to.equal(expectedText);
            expect(firstChild.getText({ includeJsDocComments: false })).to.equal(expectedText);
            expect(firstChild.getText({})).to.equal(expectedText);
        });

        it("should get with jsdoc text when specifying to", () => {
            const classCode = "/**\n * Testing\n */\nclass MyClass {}";
            const { firstChild } = getInfoFromText(classCode);
            expect(firstChild.getText(true)).to.equal(classCode);
            expect(firstChild.getText({ includeJsDocComments: true })).to.equal(classCode);
        });

        it("should get with jsdoc text when there are multiple", () => {
            const classCode = "/** Multiple */\n/**\n * Testing\n */\nclass MyClass {}";
            const { firstChild } = getInfoFromText(classCode);
            expect(firstChild.getText(true)).to.equal(classCode);
            expect(firstChild.getText({ includeJsDocComments: true })).to.equal(classCode);
        });

        it("should get with leading indentation when trimLeadingIndentation not specified or false", () => {
            const classCode = "class T {\n    /** Test */\n    method() {\n    }\n}";
            const { firstChild } = getInfoFromText<ClassDeclaration>(classCode);
            const method = firstChild.getMethodOrThrow("method");
            const expectedCode = "method() {\n    }";
            expect(method.getText({})).to.equal(expectedCode);
            expect(method.getText({ trimLeadingIndentation: false })).to.equal(expectedCode);
            expect(method.getText({ includeJsDocComments: true })).to.equal("/** Test */\n    " + expectedCode);
        });

        it("should get without leading indentation when trimLeadingIndentation specified", () => {
            const classCode = "class T {\n    /** Test */\n    method() {\n    }\n}";
            const { firstChild } = getInfoFromText<ClassDeclaration>(classCode);
            const method = firstChild.getMethodOrThrow("method");
            const expectedCode = "method() {\n}";
            expect(method.getText({ trimLeadingIndentation: true })).to.equal(expectedCode);
            expect(method.getText({ trimLeadingIndentation: true, includeJsDocComments: true })).to.equal("/** Test */\n" + expectedCode);
        });
    });

    describe(nameof<Node>(n => n._hasWrappedChildren), () => {
        it("should have wrapped children after calling getChildren()", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile("/test.ts", "class C { prop: string; }");
            expect(sourceFile._hasWrappedChildren()).to.be.false;
            sourceFile.getChildren();
            expect(sourceFile._hasWrappedChildren()).to.be.true;
            sourceFile.forgetDescendants();
            expect(sourceFile._hasWrappedChildren()).to.be.false;
        });

        it("should have wrapped children after calling forEachChild()", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile("/test.ts", "class C { prop: string; }");
            sourceFile.forEachChild(_ => {});
            expect(sourceFile._hasWrappedChildren()).to.be.true;
            sourceFile.forgetDescendants();
            expect(sourceFile._hasWrappedChildren()).to.be.false;
        });

        it("should only have wrapped children after calling getChildren() for syntax lists", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile("/test.ts", "class C { prop: string; }");
            const syntaxList = sourceFile.getChildSyntaxListOrThrow();
            expect(syntaxList._hasWrappedChildren()).to.be.false;
            syntaxList.getChildren();
            expect(syntaxList._hasWrappedChildren()).to.be.true;
            syntaxList.forgetDescendants();
            expect(syntaxList._hasWrappedChildren()).to.be.false;
        });

        it("should have wrapped children after doing forEachChild on the parent for syntax lists", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile("/test.ts", "class C { prop: string; }");
            const syntaxList = sourceFile.getChildSyntaxListOrThrow();
            expect(syntaxList._hasWrappedChildren()).to.be.false;
            sourceFile.forEachChild(() => {});
            expect(syntaxList._hasWrappedChildren()).to.be.true;
            syntaxList.forgetDescendants();
            expect(syntaxList._hasWrappedChildren()).to.be.false;
        });
    });

    describe(nameof<Node>(n => n.getParentSyntaxList), () => {
        it("should return undefined for an end of file token", () => {
            const { sourceFile } = getInfoFromText("class C {}");
            const endOfFileToken = sourceFile.getFirstChildByKindOrThrow(SyntaxKind.EndOfFileToken);
            expect(endOfFileToken.getParentSyntaxList()).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n._getParentSyntaxListIfWrapped), () => {
        it("should return undefined when not wrapped", () => {
            const { firstChild } = getInfoFromText("class C {}");
            expect(firstChild._getParentSyntaxListIfWrapped()).to.be.undefined;
        });

        it("should return the syntax list when wrapped", () => {
            const { firstChild } = getInfoFromText("class C {}");
            const syntaxList = firstChild.getParentSyntaxListOrThrow();
            expect(firstChild._getParentSyntaxListIfWrapped()).to.equal(syntaxList);
        });
    });

    describe(nameof<Node>(n => n.getFirstChildIfKind), () => {
        const { firstChild } = getInfoFromText("enum MyEnum {}");

        it("should return the first node if its the specified syntax kind", () => {
            expect(firstChild.getFirstChildIfKind(SyntaxKind.EnumKeyword)!.getText()).to.equal("enum");
        });

        it("should return undefined when the specified syntax kind isn't the first child", () => {
            expect(firstChild.getFirstChildIfKind(SyntaxKind.AbstractKeyword)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getFirstChildIfKindOrThrow), () => {
        const { firstChild } = getInfoFromText("enum MyEnum {}");

        it("should return the first node if its the specified syntax kind", () => {
            expect(firstChild.getFirstChildIfKindOrThrow(SyntaxKind.EnumKeyword).getText()).to.equal("enum");
        });

        it("should return undefined when the specified syntax kind isn't the first child", () => {
            expect(() => firstChild.getFirstChildIfKindOrThrow(SyntaxKind.AbstractKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getFirstChildByKind), () => {
        const { sourceFile, firstChild } = getInfoFromText("enum MyEnum {}");

        it("should return the first node of the specified syntax kind for a token", () => {
            expect(firstChild.getFirstChildByKind(SyntaxKind.OpenBraceToken)!.getText()).to.equal("{");
        });

        it("should return the first node of the specified syntax kind for a parsed node", () => {
            expect(sourceFile.getFirstChildByKind(SyntaxKind.EnumDeclaration)!.getText()).to.equal("enum MyEnum {}");
        });

        it("should return undefined when the specified syntax kind doesn't exist", () => {
            expect(sourceFile.getFirstChildByKind(SyntaxKind.ClassDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getChildAtPos), () => {
        const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>("function myFunction() { const v = 5; }");
        const syntaxList = sourceFile.getChildSyntaxList()!;
        const variableStatement = firstChild.getVariableStatements()[0];

        it("should return undefined when providing a value less than the node pos", () => {
            expect(syntaxList.getChildAtPos(sourceFile.getPos() - 1)).to.be.undefined;
        });

        it("should return undefined when providing a value equal to the end", () => {
            expect(syntaxList.getChildAtPos(sourceFile.getEnd())).to.be.undefined;
        });

        it("should return the child at the specified position", () => {
            expect(syntaxList.getChildAtPos(1)!.getKind()).to.equal(SyntaxKind.FunctionDeclaration);
        });

        it("should return only a child and not a descendant", () => {
            expect(syntaxList.getChildAtPos(variableStatement.getPos())!.getKind()).to.equal(SyntaxKind.FunctionDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getChildAtIndex), () => {
        const { sourceFile } = getInfoFromText("class Class { } interface Interface {}");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should throw when specifying a negative index", () => {
            expect(() => syntaxList.getChildAtIndex(-1)).to.throw();
        });

        it("should throw when specifying an index too high", () => {
            expect(() => syntaxList.getChildAtIndex(2)).to.throw();
        });

        it("should get the first child", () => {
            expect(syntaxList.getChildAtIndex(0).getKind()).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should get the last child", () => {
            expect(syntaxList.getChildAtIndex(1).getKind()).to.equal(SyntaxKind.InterfaceDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getChildAtIndexIfKind), () => {
        const { sourceFile } = getInfoFromText("class Class { }");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the child at the specified index when the kind", () => {
            expect(syntaxList.getChildAtIndexIfKind(0, SyntaxKind.ClassDeclaration)!.getKind()).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should be undefined when specifying the wrong kind", () => {
            expect(syntaxList.getChildAtIndexIfKind(0, SyntaxKind.InterfaceDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getChildAtIndexIfKindOrThrow), () => {
        const { sourceFile } = getInfoFromText("class Class { }");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the child at the specified index when the kind", () => {
            expect(syntaxList.getChildAtIndexIfKindOrThrow(0, SyntaxKind.ClassDeclaration).getKind()).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should be undefined when specifying the wrong kind", () => {
            expect(() => syntaxList.getChildAtIndexIfKindOrThrow(0, SyntaxKind.InterfaceDeclaration)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getDescendantAtPos), () => {
        const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>("function myFunction() { const v = 5; }");
        const variableStatement = firstChild.getVariableStatements()[0];

        it("should return undefined when providing a value less than the pos", () => {
            expect(sourceFile.getDescendantAtPos(sourceFile.getPos() - 1)).to.be.undefined;
        });

        it("should return undefined when providing a value equal to the end", () => {
            expect(sourceFile.getDescendantAtPos(sourceFile.getEnd())).to.be.undefined;
        });

        it("should return the descendant at the specified position", () => {
            expect(sourceFile.getDescendantAtPos(1)!.getKind()).to.equal(SyntaxKind.FunctionKeyword);
        });

        it("should return a very descendant descendant", () => {
            expect(sourceFile.getDescendantAtPos(variableStatement.getPos())!.getKind()).to.equal(SyntaxKind.ConstKeyword);
        });

        it("should return a the node at the specified pos when specifying a space", () => {
            expect(sourceFile.getDescendantAtPos(variableStatement.getPos() - 1)!.getKind()).to.equal(SyntaxKind.OpenBraceToken);
        });
    });

    describe(nameof<Node>(n => n.getDescendantStatements), () => {
        function doTest(text: string, expectedStatements: string[]) {
            const { sourceFile } = getInfoFromText(text);
            expect(sourceFile.getDescendantStatements().map(s => s.getText())).to.deep.equal(expectedStatements);
        }

        it("should get the descendant statements not including comment nodes", () => {
            const expected = [
                `const a = () => {\n    const b = "";\n};`,
                `const b = "";`,
                `const c = 5;`,
                `function d() {\n    function e() {\n        //3\n        const f = "";\n    }\n}`,
                `function e() {\n        //3\n        const f = "";\n    }`,
                `const f = "";`,
                `class MyClass {\n    prop = () => console.log("here");\n}`,
                `console.log("here")`
            ];
            doTest(`//1
/*2*/
const a = () => {
    const b = "";
};
const c = 5;
function d() {
    function e() {
        //3
        const f = "";
    }
}
class MyClass {
    prop = () => console.log("here");
}
`, expected);
        });
    });

    describe(nameof<Node>(n => n.getStartLinePos), () => {
        function doTest(text: string, expectedPos: number, includeJsDocComment?: boolean) {
            const { firstChild } = getInfoFromText(text);
            expect(firstChild.getStartLinePos(includeJsDocComment)).to.equal(expectedPos);
        }

        it("should return the start of the file when it's on the first line", () => {
            doTest("enum MyEnum {\n}\n", 0);
        });

        it("should return the start of the file when it's on the first line", () => {
            doTest("    enum MyEnum {\n}\n", 0);
        });

        it("should return the start of the line when it's not on the first line", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {\n    myMember = 1\n}\n");
            const memberDeclaration = firstChild.getMembers()[0];
            expect(memberDeclaration.getStartLinePos()).to.equal(14);
        });

        it("should return the start of the line when the past line is a \\r\\n", () => {
            doTest("\n  \t  \r\nenum MyEnum {\n}\n", 8);
        });

        it("should get the start line position of the JS doc when specified", () => {
            doTest("/**\n * Test\n */\nenum MyEnum {\n}\n", 0, true);
        });

        it("should get the start line position of not the JS doc when not specified", () => {
            doTest("/**\n * Test\n */\nenum MyEnum {\n}\n", 16);
        });
    });

    describe(nameof<Node>(n => n.getStartLineNumber), () => {
        it("should get the start line number of the node", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("\n\nclass MyClass {\n\n    prop: string;\n}");
            expect(firstChild.getInstanceProperties()[0].getStartLineNumber()).to.equal(5);
        });

        it("should get the start line number of the node including js docs", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("\n\n/** Testing*/\nclass MyClass {}");
            expect(firstChild.getStartLineNumber(true)).to.equal(3);
        });

        it("should get the start line number of the node not including js docs", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("\n\n/** Testing*/\nclass MyClass {}");
            expect(firstChild.getStartLineNumber()).to.equal(4);
        });
    });

    describe(nameof<Node>(n => n.getEndLineNumber), () => {
        it("should get the end line number of the node", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("\n\nclass MyClass {\n\n    prop: string;\n}");
            expect(firstChild.getEndLineNumber()).to.equal(6);
        });
    });

    describe(nameof<Node>(n => n.getStart), () => {
        function doTest(text: string, expectedPos: number, includeJsDocComment?: boolean) {
            const { firstChild } = getInfoFromText(text);
            expect(firstChild.getStart(includeJsDocComment)).to.equal(expectedPos);
        }

        it("should return the pos without trivia", () => {
            doTest("\n  \t  /* comment */ //comment  \r\n  \t enum MyEnum {\n}\n", 37);
        });

        it("should return the pos at the start of the js doc comment if specified", () => {
            doTest("/**\n * Test\n */\nenum MyEnum {\n}\n", 0, true);
        });
    });

    describe(nameof<Node>(n => n.getWidth), () => {
        function doTest(text: string, expectedWidth: number, includeJsDocComment?: boolean) {
            const { firstChild } = getInfoFromText(text);
            expect(firstChild.getWidth(includeJsDocComment)).to.equal(expectedWidth);
        }

        it("should return the width without trivia", () => {
            doTest("\n  \t  /* comment */ //comment  \r\n  \t enum MyEnum {\n}\n", 15);
        });

        it("should return the width at the start of the js doc comment if specified", () => {
            const text = "/**\n * Test\n */\nenum MyEnum {\n}\n";
            doTest(text, text.length - 1, true);
        });
    });

    describe(nameof<Node>(n => n.getCombinedModifierFlags), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        it("should get the combined modifier flags", () => {
            expect(firstChild.getCombinedModifierFlags()).to.equal(ts.ModifierFlags.Export);
        });
    });

    describe(nameof<NodeParentType<any>>(), () => {
        it("should have the correct type when it will have a parent", () => {
            assert<IsExact<NodeParentType<ts.VariableDeclarationList>, VariableStatement | ForStatement | ForOfStatement | ForInStatement>>(true);
        });

        it("should have the correct type when it might not have a parent", () => {
            assert<IsExact<NodeParentType<ts.Node>, Node | undefined>>(true);
        });

        it("should have the correct type when it's a source file", () => {
            assert<IsExact<NodeParentType<ts.SourceFile>, undefined>>(true);
        });
    });

    describe(nameof<Node>(n => n.getParentIf), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it matches the condition", () => {
            expect(child.getParentIf(n => n !== undefined && n.getKind() === SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should not get the parent when doesn't match the condition", () => {
            expect(child.getParentIf(n => n !== undefined && n.getKind() === SyntaxKind.InterfaceDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getParentIfOrThrow), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it matches the condition", () => {
            expect(child.getParentIfOrThrow(n => n !== undefined && n.getKind() === SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should throw when the parent doesn't match the condition", () => {
            expect(() => child.getParentIfOrThrow(n => n !== undefined && n.getKind() === SyntaxKind.InterfaceDeclaration)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getParentIfKind), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it's the right kind", () => {
            expect(child.getParentIfKind(SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should not get the parent when it's not the right kind", () => {
            expect(child.getParentIfKind(SyntaxKind.InterfaceDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getParentIfKindOrThrow), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it's the right kind", () => {
            expect(child.getParentIfKindOrThrow(SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should throw when the parent is not the right kind", () => {
            expect(() => child.getParentIfKindOrThrow(SyntaxKind.InterfaceDeclaration)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getParentWhile), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const { sourceFile } = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhile(n => n.getKind() === SyntaxKind.PropertyAccessExpression)!;
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const { sourceFile } = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(child.getParentWhile(() => false)).to.be.undefined;
        });

        it("should get by a type guard", () => {
            const { sourceFile } = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const node = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test4");
            const result = node.getParentWhile(Node.isPropertyAccessExpression);
            assert<IsExact<typeof result, PropertyAccessExpression | undefined>>(true);
            expect(result).to.be.instanceOf(PropertyAccessExpression);
            expect(result!.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should work with the second parameter", () => {
            const { sourceFile } = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const node = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test2");
            const result = node.getParentWhile((parent, child) => parent.getText() !== "Test.Test2.Test3.Test4" && child.getText() !== "Test.Test2.Test3");
            expect(result!.getText()).to.equal("Test.Test2.Test3");
        });
    });

    describe(nameof<Node>(n => n.getParentWhileOrThrow), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const { sourceFile } = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhileOrThrow(n => n.getKind() === SyntaxKind.PropertyAccessExpression);
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const { sourceFile } = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(() => child.getParentWhileOrThrow(() => false)).to.throw();
        });

        it("should get by a type guard", () => {
            const { sourceFile } = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const node = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test4");
            const result = node.getParentWhileOrThrow(Node.isPropertyAccessExpression);
            assert<IsExact<typeof result, PropertyAccessExpression>>(true);
            expect(result).to.be.instanceOf(PropertyAccessExpression);
            expect(result.getText()).to.equal("Test.Test2.Test3.Test4");
        });
    });

    describe(nameof<Node>(n => n.getParentWhileKind), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const { sourceFile } = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhileKind(SyntaxKind.PropertyAccessExpression)!;
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const { sourceFile } = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(child.getParentWhileKind(SyntaxKind.PrivateKeyword)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getParentWhileKindOrThrow), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const { sourceFile } = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhileKindOrThrow(SyntaxKind.PropertyAccessExpression);
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const { sourceFile } = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(() => child.getParentWhileKindOrThrow(SyntaxKind.PrivateKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getFirstChild), () => {
        const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>("class Identifier { prop: string; }\ninterface MyInterface {}");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the first child by a condition", () => {
            expect(syntaxList.getFirstChild(n => n.getKind() === SyntaxKind.InterfaceDeclaration)).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should get the first child by a type guard", () => {
            const result = syntaxList.getFirstChild(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration | undefined>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should return undefined when it can't find the child", () => {
            expect(syntaxList.getFirstChild(n => n.getKind() === SyntaxKind.IsKeyword)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getFirstChildOrThrow), () => {
        const { sourceFile } = getInfoFromText<ClassDeclaration>("class Identifier { prop: string; }\ninterface MyInterface {}");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the first child by a condition", () => {
            expect(syntaxList.getFirstChildOrThrow(n => n.getKind() === SyntaxKind.InterfaceDeclaration)).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should get the first child by a type guard", () => {
            const result = syntaxList.getFirstChildOrThrow(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should throw when it can't find the child", () => {
            expect(() => syntaxList.getFirstChildOrThrow(n => n.getKind() === SyntaxKind.IsKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getLastChild), () => {
        const { sourceFile } = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface {}");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the last child by a condition", () => {
            const interfaceDec = syntaxList.getLastChild(n => n.getKind() === SyntaxKind.InterfaceDeclaration) as InterfaceDeclaration;
            expect(interfaceDec.getName()).to.equal("MyInterface");
        });

        it("should get the last child by a type guard", () => {
            const result = syntaxList.getLastChild(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration | undefined>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should return undefined when it can't find the child", () => {
            expect(syntaxList.getLastChild(n => n.getKind() === SyntaxKind.IsKeyword)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getLastChildOrThrow), () => {
        const { sourceFile } = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface {}");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the last child by a condition", () => {
            const interfaceDec = syntaxList.getLastChildOrThrow(n => n.getKind() === SyntaxKind.InterfaceDeclaration) as InterfaceDeclaration;
            expect(interfaceDec.getName()).to.equal("MyInterface");
        });

        it("should get the last child by a type guard", () => {
            const result = syntaxList.getLastChildOrThrow(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should throw when it can't find the child", () => {
            expect(() => syntaxList.getLastChildOrThrow(n => n.getKind() === SyntaxKind.IsKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getFirstAncestor), () => {
        const { sourceFile } = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\n");
        const interfaceDec = sourceFile.getInterfaceOrThrow("Identifier");
        const propDec = interfaceDec.getPropertyOrThrow("prop");

        it("should get the first ancestor by a condition", () => {
            const result = propDec.getFirstAncestor(n => n.getKind() === SyntaxKind.SourceFile);
            expect(result).to.be.instanceOf(SourceFile);
        });

        it("should get by a type guard", () => {
            const result = propDec.getFirstAncestor(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration | undefined>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should return undefined when it can't find it", () => {
            const privateKeyword = propDec.getFirstAncestor(n => n.getKind() === SyntaxKind.PrivateKeyword);
            expect(privateKeyword).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getFirstAncestorOrThrow), () => {
        const { sourceFile } = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\n");
        const interfaceDec = sourceFile.getInterfaceOrThrow("Identifier");
        const propDec = interfaceDec.getPropertyOrThrow("prop");

        it("should get the first ancestor by a condition", () => {
            const result = propDec.getFirstAncestorOrThrow(n => n.getKind() === SyntaxKind.SourceFile);
            expect(result).to.be.instanceOf(SourceFile);
        });

        it("should get by a type guard", () => {
            const result = propDec.getFirstAncestorOrThrow(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should throw when it can't find it", () => {
            expect(() => propDec.getFirstAncestorOrThrow(n => n.getKind() === SyntaxKind.PrivateKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendant), () => {
        const { sourceFile } = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

        it("should get the first descendant by a condition", () => {
            const prop = sourceFile.getFirstDescendant(n => n.getKind() === SyntaxKind.PropertySignature);
            expect(prop).to.be.instanceOf(PropertySignature);
            expect((prop as PropertySignature).getName()).to.equal("prop");
        });

        it("should get by a type guard", () => {
            const result = sourceFile.getFirstDescendant(Node.isPropertySignature);
            assert<IsExact<typeof result, PropertySignature | undefined>>(true);
            expect(result).to.be.instanceOf(PropertySignature);
        });

        it("should return undefined when it can't find it", () => {
            const privateKeyword = sourceFile.getFirstDescendant(n => n.getKind() === SyntaxKind.PrivateKeyword);
            expect(privateKeyword).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendantOrThrow), () => {
        const { sourceFile } = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

        it("should get the first descendant by a condition", () => {
            const prop = sourceFile.getFirstDescendantOrThrow(n => n.getKind() === SyntaxKind.PropertySignature);
            expect(prop).to.be.instanceOf(PropertySignature);
            expect((prop as PropertySignature).getName()).to.equal("prop");
        });

        it("should get by a type guard", () => {
            const result = sourceFile.getFirstDescendantOrThrow(Node.isPropertySignature);
            assert<IsExact<typeof result, PropertySignature>>(true);
            expect(result).to.be.instanceOf(PropertySignature);
        });

        it("should return undefined when it can't find it", () => {
            expect(() => sourceFile.getFirstDescendantOrThrow(n => n.getKind() === SyntaxKind.PrivateKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getChildrenOfKind), () => {
        function doTest(text: string, selectNode: (sourceFile: SourceFile) => Node, kind: SyntaxKind, childTexts: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const node = selectNode(sourceFile);
            const children = node.getChildrenOfKind(kind);
            expect(children.map(c => c.getText())).to.deep.equal(childTexts);
        }

        it("should get children using .forEachChild when specifying a parsed kind node while not on a syntax list", () => {
            doTest("class C {} interface I {}", sourceFile => sourceFile, SyntaxKind.ClassDeclaration, ["class C {}"]);
        });

        it("should get children using .getChildren() when on a syntax list", () => {
            doTest("class C {} interface I {}", sourceFile => sourceFile.getChildSyntaxListOrThrow(), SyntaxKind.ClassDeclaration, ["class C {}"]);
        });

        it("should get children using .getChildren() when specifying a token kind", () => {
            doTest("class C {}", sourceFile => sourceFile.getClassOrThrow("C"), SyntaxKind.OpenBraceToken, ["{"]);
        });

        it("should get comments", () => {
            doTest("//1", sourceFile => sourceFile.getChildSyntaxListOrThrow(), SyntaxKind.SingleLineCommentTrivia, ["//1"]);
        });
    });

    describe(nameof<Node>(n => n.getDescendantsOfKind), () => {
        it("should get the descendant by a kind", () => {
            const { sourceFile } = getInfoFromText("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");
            const properties = sourceFile.getDescendantsOfKind(SyntaxKind.PropertySignature);
            expect(properties.length).to.equal(2);
            expect(properties[0]).to.be.instanceOf(PropertySignature);
            expect(properties[1]).to.be.instanceOf(PropertySignature);
        });

        function doTest(
            text: string,
            selectNode: (sourceFile: SourceFile) => Node,
            kind: SyntaxKind,
            descendantTexts: string[],
            additionalChecks?: (sourceFile: SourceFile) => void
        ) {
            const { sourceFile } = getInfoFromText(text);
            const node = selectNode(sourceFile);
            const descendants = node.getDescendantsOfKind(kind);
            expect(descendants.map(c => c.getText())).to.deep.equal(descendantTexts);

            if (additionalChecks)
                additionalChecks(sourceFile);
        }

        it("should get descendants using .forEachChild when specifying a parsed kind node while not on a syntax list", () => {
            doTest("class C1 {} class C2 {}", sourceFile => sourceFile, SyntaxKind.ClassDeclaration, ["class C1 {}", "class C2 {}"], sourceFile => {
                expect(hasParsedTokens(sourceFile.compilerNode)).to.be.false;
                expect(hasParsedTokens(sourceFile.getClassOrThrow("C1").compilerNode)).to.be.false;
            });
        });

        it("should get descendants using .getChildren() for the initial syntax list and then forEachChild afterwards when specifying a parsed kind node", () => {
            doTest(
                "class C {} interface I {}",
                sourceFile => sourceFile.getChildSyntaxListOrThrow(),
                SyntaxKind.ClassDeclaration,
                ["class C {}"],
                sourceFile => {
                    expect(hasParsedTokens(sourceFile.compilerNode)).to.be.true;
                    expect(hasParsedTokens(sourceFile.getClassOrThrow("C").compilerNode)).to.be.false;
                }
            );
        });

        it("should get descendants using .getChildren() when specifying a token while on a syntax list", () => {
            doTest("class C {} interface I {}", sourceFile => sourceFile.getChildSyntaxListOrThrow(), SyntaxKind.OpenBraceToken, ["{", "{"]);
        });

        it("should get descendants using .getChildren() when specifying a token kind", () => {
            doTest("class C {} interface I {}", sourceFile => sourceFile, SyntaxKind.OpenBraceToken, ["{", "{"], sourceFile => {
                expect(hasParsedTokens(sourceFile.compilerNode)).to.be.true;
            });
        });

        it("should get comments", () => {
            doTest("//1", sourceFile => sourceFile, SyntaxKind.SingleLineCommentTrivia, ["//1"]);
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendantByKind), () => {
        function getSourceFile() {
            return getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }").sourceFile;
        }

        it("should get the first descendant by a condition", () => {
            const prop = getSourceFile().getFirstDescendantByKind(SyntaxKind.PropertySignature);
            expect(prop).to.be.instanceOf(PropertySignature);
            expect((prop as PropertySignature).getName()).to.equal("prop");
        });

        it("should return undefined when it can't find it", () => {
            const privateKeyword = getSourceFile().getFirstDescendantByKind(SyntaxKind.PrivateKeyword);
            expect(privateKeyword).to.be.undefined;
        });

        function doTest(
            text: string,
            selectNode: (sourceFile: SourceFile) => Node,
            kind: SyntaxKind,
            descendantText: string | undefined,
            additionalChecks?: (sourceFile: SourceFile) => void
        ) {
            const { sourceFile } = getInfoFromText(text);
            const node = selectNode(sourceFile);
            const descendant = node.getFirstDescendantByKind(kind);
            expect(descendant?.getText()).to.equal(descendantText);

            if (additionalChecks)
                additionalChecks(sourceFile);
        }

        it("should get descendant using .forEachChild when specifying a parsed kind node while not on a syntax list", () => {
            doTest("class C1 {} class C2 {}", sourceFile => sourceFile, SyntaxKind.ClassDeclaration, "class C1 {}", sourceFile => {
                expect(hasParsedTokens(sourceFile.compilerNode)).to.be.false;
                expect(hasParsedTokens(sourceFile.getClassOrThrow("C1").compilerNode)).to.be.false;
            });
        });

        it("should get descendants using .getChildren() for the initial syntax list and then forEachChild afterwards when specifying a parsed kind node", () => {
            doTest(
                "class C {} interface I {}",
                sourceFile => sourceFile.getChildSyntaxListOrThrow(),
                SyntaxKind.InterfaceDeclaration,
                "interface I {}",
                sourceFile => {
                    expect(hasParsedTokens(sourceFile.compilerNode)).to.be.true;
                    expect(hasParsedTokens(sourceFile.getClassOrThrow("C").compilerNode)).to.be.false;
                    expect(hasParsedTokens(sourceFile.getInterfaceOrThrow("I").compilerNode)).to.be.false;
                }
            );
        });

        it("should get descendants using .getChildren() when specifying a token while on a syntax list", () => {
            doTest("class C {} interface I {}", sourceFile => sourceFile.getChildSyntaxListOrThrow(), SyntaxKind.OpenBraceToken, "{");
        });

        it("should get descendants using .getChildren() when specifying a token kind", () => {
            doTest("class C {} interface I {}", sourceFile => sourceFile, SyntaxKind.OpenBraceToken, "{", sourceFile => {
                expect(hasParsedTokens(sourceFile.compilerNode)).to.be.true;
            });
        });

        it("should get js doc descendants", () => {
            doTest(
                "/**\n * @return {string}\n */\nfunction test() {}",
                sourceFile => sourceFile,
                SyntaxKind.JSDocReturnTag,
                "@return {string}",
                sourceFile => {
                    // todo: in the future it would be better for this to be false and only parse the tokens on JSDoc nodes
                    expect(hasParsedTokens(sourceFile.compilerNode)).to.be.true;
                }
            );
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendantByKindOrThrow), () => {
        const { sourceFile } = getInfoFromText("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

        it("should get the first descendant by a condition", () => {
            const prop = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertySignature);
            expect(prop).to.be.instanceOf(PropertySignature);
            expect((prop as PropertySignature).getName()).to.equal("prop");
        });

        it("should return undefined when it can't find it", () => {
            expect(() => sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PrivateKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getPreviousSibling), () => {
        const { sourceFile } = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSibling(s => Node.isInterfaceDeclaration(s) && s.getName() === "Interface1")!.getText())
                .to.equal("interface Interface1 {}");
        });

        it("should get the previous sibling when not supplying a condition", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSibling()!.getText()).to.equal("interface Interface2 {}");
        });

        it("should return undefined when it can't find the sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSibling(s => false)).to.be.undefined;
        });

        it("should return undefined when there isn't a previous sibling", () => {
            expect(sourceFile.getInterfaces()[0].getPreviousSibling()).to.be.undefined;
        });

        it("should get by a type guard", () => {
            const result = sourceFile.getInterfaces()[1].getPreviousSibling(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration | undefined>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getPreviousSiblingOrThrow), () => {
        const { sourceFile } = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous sibling based on a condition", () => {
            expect(
                sourceFile.getInterfaces()[2]
                    .getPreviousSiblingOrThrow(s => Node.isInterfaceDeclaration(s) && s.getName() === "Interface1")
                    .getText()
            ).to.equal("interface Interface1 {}");
        });

        it("should get the previous sibling when not supplying a condition", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSiblingOrThrow().getText()).to.equal("interface Interface2 {}");
        });

        it("should throw when it can't find the sibling based on a condition", () => {
            expect(() => sourceFile.getInterfaces()[2].getPreviousSiblingOrThrow(s => false)).to.throw();
        });

        it("should throw when there isn't a previous sibling", () => {
            expect(() => sourceFile.getInterfaces()[0].getPreviousSiblingOrThrow()).to.throw();
        });

        it("should get by a type guard", () => {
            const result = sourceFile.getInterfaces()[1].getPreviousSiblingOrThrow(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getNextSibling), () => {
        const { sourceFile } = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the next sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[0].getNextSibling(s => Node.isInterfaceDeclaration(s) && s.getName() === "Interface3")!.getText())
                .to.equal("interface Interface3 {}");
        });

        it("should get the next sibling when not supplying a condition", () => {
            expect(sourceFile.getInterfaces()[0].getNextSibling()!.getText()).to.equal("interface Interface2 {}");
        });

        it("should return undefined when it can't find the sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[0].getNextSibling(s => false)).to.be.undefined;
        });

        it("should return undefined when there isn't a next sibling", () => {
            expect(sourceFile.getInterfaces()[2].getNextSibling()).to.be.undefined;
        });

        it("should get by a type guard", () => {
            const result = sourceFile.getInterfaces()[1].getNextSibling(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration | undefined>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getNextSiblingOrThrow), () => {
        const { sourceFile } = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the next sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[0].getNextSiblingOrThrow(s => Node.isInterfaceDeclaration(s) && s.getName() === "Interface3").getText())
                .to.equal("interface Interface3 {}");
        });

        it("should get the next sibling when not supplying a condition", () => {
            expect(sourceFile.getInterfaces()[0].getNextSiblingOrThrow().getText()).to.equal("interface Interface2 {}");
        });

        it("should throw when it can't find the sibling based on a condition", () => {
            expect(() => sourceFile.getInterfaces()[0].getNextSiblingOrThrow(s => false)).to.throw();
        });

        it("should throw when there isn't a next sibling", () => {
            expect(() => sourceFile.getInterfaces()[2].getNextSiblingOrThrow()).to.throw();
        });

        it("should get by a type guard", () => {
            const result = sourceFile.getInterfaces()[1].getNextSiblingOrThrow(Node.isInterfaceDeclaration);
            assert<IsExact<typeof result, InterfaceDeclaration>>(true);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getPreviousSiblings), () => {
        const { sourceFile } = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous siblings going away in order", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSiblings().map(s => (s as InterfaceDeclaration).getName()))
                .to.deep.equal(["Interface2", "Interface1"]);
        });
    });

    describe(nameof<Node>(n => n.getNextSiblings), () => {
        const { sourceFile } = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous siblings going away in order", () => {
            expect(sourceFile.getInterfaces()[0].getNextSiblings().map(s => (s as InterfaceDeclaration).getName()))
                .to.deep.equal(["Interface2", "Interface3"]);
        });
    });

    describe(nameof<Node>(n => n.isFirstNodeOnLine), () => {
        function doTest(text: string, index: number, expected: boolean) {
            const { sourceFile } = getInfoFromText(text);
            expect(sourceFile.getFirstChildIfKindOrThrow(SyntaxKind.SyntaxList).getChildren()[index].isFirstNodeOnLine()).to.equal(expected);
        }

        it("should be true if it is and it's on the first line", () => {
            doTest("    interface MyTest {}", 0, true);
        });

        it("should be true if it is and on a line within the file", () => {
            doTest("interface MyTest {}\n    \tclass Test {}", 1, true);
        });

        it("should be false if there's something else and it's the first line", () => {
            doTest("    interface MyTest {} class Test {}", 1, false);
        });

        it("should be false if there's something else and it's on a line within the file", () => {
            doTest("\n\ninterface MyTest {\n} class Test {}", 1, false);
        });
    });

    describe(nameof<Node>(n => n.replaceWithText), () => {
        function doTest(startText: string, replaceText: string | WriterFunction, expectedText: string) {
            const { sourceFile } = getInfoFromText(startText);
            const varDeclaration = sourceFile.getVariableDeclarations()[0];
            const propAccess = (varDeclaration.getInitializerOrThrow() as PropertyAccessExpression);
            let newNode: Node;
            if (typeof replaceText === "string")
                newNode = propAccess.replaceWithText(replaceText);
            else
                newNode = propAccess.replaceWithText(replaceText);
            expect(newNode.getText()).to.equal(getReplaceTextAsString());
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(propAccess.wasForgotten()).to.be.true;

            function getReplaceTextAsString() {
                if (typeof replaceText === "string")
                    return replaceText;

                const writer = new CodeBlockWriter();
                replaceText(writer);
                return writer.toString();
            }
        }

        it("should replace when using a string", () => {
            doTest("var t = Some.Prop.Access.Expression;", "NewText", "var t = NewText;");
        });

        it("should replace when using a writer", () => {
            doTest("var t = Some.Prop.Access.Expression;", writer => writer.write("NewText"), "var t = NewText;");
        });

        it("should replace the text for a source file", () => {
            const { sourceFile } = getInfoFromText("var t = Some.Prop.Access;");
            const result = sourceFile.replaceWithText("var t;");
            expect(sourceFile.getFullText()).to.equal("var t;"); // in this case, it will not forget the source file
            expect(result).to.equal(sourceFile);
        });

        it("should not replace the jsdoc text", () => {
            const { firstChild, sourceFile } = getInfoFromText("/**\n * Testing\n */\nclass MyClass {}");
            const result = firstChild.replaceWithText("var t;");
            expect(sourceFile.getFullText()).to.equal("var t;");
            expect(result).to.equal(sourceFile.getStatements()[0]);
        });

        it("should replace midway through a prop access expression", () => {
            const { sourceFile } = getInfoFromText("var t = this.writer.space();");
            const varDeclaration = sourceFile.getVariableDeclarations()[0];
            const propAccess = ((varDeclaration.getInitializerOrThrow() as CallExpression).getExpression() as PropertyAccessExpression).getExpression();
            propAccess.replaceWithText("writer");
            expect(sourceFile.getFullText()).to.equal("var t = writer.space();");
        });

        it("should throw when replacing with more than one node", () => {
            const { sourceFile } = getInfoFromText("var t = Some.Prop.Access;");
            const varDeclaration = sourceFile.getVariableDeclarations()[0];
            const propAccess = (varDeclaration.getInitializerOrThrow() as PropertyAccessExpression);
            expect(() => {
                propAccess.replaceWithText("SomeTest; Test");
            }).to.throw();
        });

        it("should replace identifier in property access expression with a call expression", () => {
            const { sourceFile } = getInfoFromText("Some.Prop.Access.Expr;");
            const someIdentifier = sourceFile.getFirstDescendantOrThrow(d => d.getKind() === SyntaxKind.Identifier && d.getText() === "Some");
            someIdentifier.replaceWithText("Some()");
            expect(sourceFile.getFullText()).to.equal("Some().Prop.Access.Expr;");
        });

        it("should replace call expression identifier deep in a property access expression", () => {
            const { sourceFile } = getInfoFromText("Some().Prop.Access.Expr;");
            const someIdentifier = sourceFile.getFirstDescendantOrThrow(d => d.getKind() === SyntaxKind.Identifier && d.getText() === "Some");
            someIdentifier.replaceWithText("Some()");
            expect(sourceFile.getFullText()).to.equal("Some()().Prop.Access.Expr;");
        });
    });

    describe(nameof<Node>(n => n.print), () => {
        const nodeText = "class MyClass {\n    // comment\n    prop: string;\n}";
        const { sourceFile, firstChild } = getInfoFromText(nodeText);

        it("should print the source file", () => {
            expect(sourceFile.print()).to.equal(nodeText + "\n");
        });

        it("should print the node", () => {
            expect(firstChild.print()).to.equal(nodeText);
        });

        it("should print the node with different newlines", () => {
            expect(firstChild.print({ newLineKind: NewLineKind.CarriageReturnLineFeed })).to.equal(nodeText.replace(/\n/g, "\r\n"));
        });
    });

    describe(nameof<Node>(n => n.formatText), () => {
        function doTest(text: string, getNode: (sourceFile: SourceFile) => Node, expectedText: string, settings: FormatCodeSettings = {}) {
            const { sourceFile } = getInfoFromText(text);
            getNode(sourceFile).formatText(settings);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should format only the provided node", () => {
            doTest("class Test{\n   prop:string;\n  }\nclass Test2{\n   prop:string;\n  }\n", f => f.getClassOrThrow("Test2"),
                "class Test{\n   prop:string;\n  }\nclass Test2 {\n    prop: string;\n}\n");
        });

        it("should format only the provided node with the specified settings", () => {
            doTest(
                "class Test{\n\tprop:string;\n}\n       /** Testing */\nclass Test2{\n\t prop:string;\n\t}\n",
                f => f.getClassOrThrow("Test2"),
                "class Test{\n\tprop:string;\n}\n/** Testing */\nclass Test2 {\n  prop: string;\n}\n",
                {
                    convertTabsToSpaces: true,
                    indentSize: 2
                }
            );
        });
    });

    describe(nameof<Node>(n => n.prependWhitespace), () => {
        function doTest(text: string, getNode: (sourceFile: SourceFile) => Node, newText: string | WriterFunction, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const node = getNode(sourceFile);
            node.prependWhitespace(newText);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(node.wasForgotten()).to.be.false;
        }

        it("should prepend whitespace", () => {
            doTest(
                "class Test{\n  prop:string;\n}",
                f => f.getClassOrThrow("Test").getProperties()[0],
                "  \t\n ",
                "class Test{\n    \t\n     prop:string;\n}"
            );
        });

        it("should prepend whitespace when using a writer", () => {
            doTest(
                "class Test{\n  prop:string;\n}",
                f => f.getClassOrThrow("Test").getProperties()[0],
                writer => writer.space(),
                "class Test{\n   prop:string;\n}"
            );
        });

        it("should throw if providing non-whitespace text", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.prependWhitespace("testing")).to.throw(errors.InvalidOperationError);
        });
    });

    describe(nameof<Node>(n => n.appendWhitespace), () => {
        function doTest(text: string, getNode: (sourceFile: SourceFile) => Node, newText: string | WriterFunction, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const node = getNode(sourceFile);
            node.appendWhitespace(newText);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(node.wasForgotten()).to.be.false;
        }

        it("should append whitespace", () => {
            doTest(
                "class Test{\n  prop:string;\n}",
                f => f.getClassOrThrow("Test").getProperties()[0],
                "  \t\n ",
                "class Test{\n  prop:string;  \t\n     \n}"
            );
        });

        it("should append whitespace when using a writer", () => {
            doTest(
                "class Test{\n  prop:string;\n}",
                f => f.getClassOrThrow("Test").getProperties()[0],
                writer => writer.space(),
                "class Test{\n  prop:string; \n}"
            );
        });

        it("should throw if providing non-whitespace text", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.appendWhitespace("testing")).to.throw(errors.InvalidOperationError);
        });
    });

    describe(nameof<Node>(n => n.getLeadingCommentRanges), () => {
        it("should return nothing for a source file", () => {
            const { sourceFile } = getInfoFromText("// before1\nvar t = 5;");
            expect(sourceFile.getLeadingCommentRanges().length).to.equal(0);
        });

        it("should get the leading comment ranges", () => {
            const { firstChild } = getInfoFromText("// before1\n// before2\n/* before3 */var t = 5; // after");
            expect(firstChild.getLeadingCommentRanges().map(r => r.getText())).to.deep.equal(["// before1", "// before2", "/* before3 */"]);
        });

        it("should forget the leading comment range after forgetting the node", () => {
            const { firstChild } = getInfoFromText("// before\nvar t = 5;");
            const commentRange = firstChild.getLeadingCommentRanges()[0];
            expect(commentRange).to.not.be.undefined;
            firstChild.forget();
            expect(commentRange.wasForgotten()).to.be.true;
            expect(() => commentRange.getText()).to.throw(errors.InvalidOperationError);
        });

        it("should forget a leading comment range after a manipulation", () => {
            const { firstChild, sourceFile } = getInfoFromText("// before\nvar t = 5;");
            const commentRange = firstChild.getLeadingCommentRanges()[0];
            expect(commentRange).to.not.be.undefined;
            sourceFile.addEnum({ name: "Enum" });
            expect(commentRange.wasForgotten()).to.be.true;
            expect(() => commentRange.getText()).to.throw(errors.InvalidOperationError);
            expect(firstChild.getLeadingCommentRanges()[0].getText()).to.equal("// before");
        });
    });

    describe(nameof<Node>(n => n.getTrailingCommentRanges), () => {
        it("should get the trailing comment ranges", () => {
            const { firstChild } = getInfoFromText("// before\nvar t = 5; // after1\n// after2\n/* after3 */");
            expect(firstChild.getTrailingCommentRanges().map(r => r.getText())).to.deep.equal(["// after1"]);
        });

        it("should return the comment ranges for syntax kinds", () => {
            const { sourceFile } = getInfoFromText("var t = 5; /* testing */");
            expect(sourceFile.getChildSyntaxListOrThrow().getTrailingCommentRanges().map(r => r.getText())).to.deep.equal(["/* testing */"]);
        });

        it("should get the trailing comment ranges when there are multiple", () => {
            const { firstChild } = getInfoFromText("// before\nvar t = 5; /* after1 *//* after2 *//* after3 */");
            expect(firstChild.getTrailingCommentRanges().map(r => r.getText())).to.deep.equal(["/* after1 */", "/* after2 */", "/* after3 */"]);
        });

        it("should forget the trailing comment range after forgetting the node", () => {
            const { firstChild } = getInfoFromText("var t = 5; // after");
            const commentRange = firstChild.getTrailingCommentRanges()[0];
            expect(commentRange).to.not.be.undefined;
            firstChild.forget();
            expect(commentRange.wasForgotten()).to.be.true;
            expect(() => commentRange.getText()).to.throw(errors.InvalidOperationError);
        });

        it("should forget a trailing comment range after a manipulation", () => {
            const { firstChild, sourceFile } = getInfoFromText("var t = 5; // after");
            const commentRange = firstChild.getTrailingCommentRanges()[0];
            expect(commentRange).to.not.be.undefined;
            sourceFile.insertEnum(0, { name: "Enum" });
            expect(commentRange.wasForgotten()).to.be.true;
            expect(() => commentRange.getText()).to.throw(errors.InvalidOperationError);
            expect(firstChild.getTrailingCommentRanges()[0].getText()).to.equal("// after");
        });
    });

    describe(nameof<Node>(n => n.getTrailingTriviaEnd), () => {
        function doTest(text: string, expected: number) {
            const { firstChild } = getInfoFromText(text);
            expect(firstChild.getTrailingTriviaEnd()).to.equal(expected);
        }

        it("should get the trailing trivia end at a new line", () => {
            const startText = "   var t = 5; // testing";
            doTest(startText + "\n //next", startText.length);
        });

        it("should get the trailing trivia end at the next significant token", () => {
            const startText = "   var t = 5; /* testing */ /* next */ \t ";
            doTest(startText + "var m = 4;", startText.length);
        });

        it("should get the trailing trivia end at the end of a file", () => {
            const startText = "var t = 5; \t  \t";
            doTest(startText, startText.length);
        });

        it("should return the end of the file for a source file", () => {
            const { sourceFile } = getInfoFromText("var t = 5; \t\n\n\n");
            expect(sourceFile.getTrailingTriviaEnd()).to.equal(sourceFile.getEnd());
        });
    });

    describe(nameof<Node>(n => n.getTrailingTriviaWidth), () => {
        function doTest(text: string, expected: number) {
            const { firstChild } = getInfoFromText(text);
            expect(firstChild.getTrailingTriviaWidth()).to.equal(expected);
        }

        it("should get the trailing trivia width", () => {
            const startText = "var t = 5;";
            const triviaText = "\t  \t /* testing */  \t";
            doTest(startText + triviaText, triviaText.length);
        });
    });

    describe(nameof<Node>(n => n.forEachChild), () => {
        function doNodeCbSyntaxKindTest(node: Node, expectedKinds: SyntaxKind[], callback?: (child: Node) => unknown, expectedReturnValue?: Node) {
            const foundKinds: SyntaxKind[] = [];
            const returnValue = node.forEachChild<unknown>(child => {
                foundKinds.push(child.getKind());
                if (callback)
                    return callback(child);
            });
            expect(foundKinds).to.deep.equal(expectedKinds);
            expect(returnValue).to.deep.equal(expectedReturnValue);
        }

        it("should iterate over all the children of a source file", () => {
            const { sourceFile } = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration, SyntaxKind.EndOfFileToken]);
        });

        it("should iterate over all the children when it includes an array", () => {
            const { firstChild } = getInfoFromText("class Test { prop: string; method() {} }");
            doNodeCbSyntaxKindTest(firstChild, [SyntaxKind.Identifier, SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]);
        });

        it("should stop iteration when returning a node in a callback and return it", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Test { prop: string; method() {} }");
            doNodeCbSyntaxKindTest(firstChild, [SyntaxKind.Identifier, SyntaxKind.PropertyDeclaration], node => {
                if (node.getKind() === SyntaxKind.PropertyDeclaration)
                    return node;
                return undefined;
            }, firstChild.getProperties()[0]);
        });

        function doNodeArrayCbSyntaxKindTest(node: Node, expectedNodeKinds: SyntaxKind[], expectedArrayKinds: SyntaxKind[][], forceStop = false) {
            const foundNodeKinds: SyntaxKind[] = [];
            const foundArrayKinds: SyntaxKind[][] = [];
            node.forEachChild<number>(child => {
                foundNodeKinds.push(child.getKind());
                return undefined;
            }, childArray => {
                foundArrayKinds.push(childArray.map(c => c.getKind()));
                if (forceStop)
                    return 1; // return truthy value
                return undefined;
            });

            expect(foundNodeKinds).to.deep.equal(expectedNodeKinds);
            expect(foundArrayKinds).to.deep.equal(expectedArrayKinds);
        }

        it("should iterate over all the children when it includes an array when using an array callback", () => {
            const { firstChild } = getInfoFromText("export class Test { prop: string; method() {} }");
            doNodeArrayCbSyntaxKindTest(firstChild, [SyntaxKind.Identifier], [
                [SyntaxKind.ExportKeyword],
                [SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]
            ]);
        });

        it("should stop iteration when returning a value in an array callback", () => {
            const { firstChild } = getInfoFromText("export class Test { prop: string; method() {} }");
            doNodeArrayCbSyntaxKindTest(firstChild, [], [[SyntaxKind.ExportKeyword]], true);
        });

        it("should return the value in an array callback", () => {
            const { firstChild } = getInfoFromText("class Test { prop: string; method() {} }");
            const value = firstChild.forEachChild(() => {
                return undefined as any as boolean;
            }, () => {
                return true;
            });
            expect(value).to.equal(true);
        });

        it("should not stop when both callbacks don't return values", () => {
            const { firstChild } = getInfoFromText("class Test { prop: string; method() {} }");
            const foundNodeKinds: SyntaxKind[] = [];
            const foundArrayKinds: SyntaxKind[][] = [];
            firstChild.forEachChild(node => {
                foundNodeKinds.push(node.getKind());
            }, nodeArray => {
                foundArrayKinds.push(nodeArray.map(n => n.getKind()));
            });
            expect(foundNodeKinds).to.deep.equal([SyntaxKind.Identifier]);
            expect(foundArrayKinds).to.deep.equal([[SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]]);
        });

        it("should be able to modify nodes midway through", () => {
            const { sourceFile } = getInfoFromText("const t = 5;");
            const variable = sourceFile.getVariableDeclarationOrThrow("t");
            const nodeTexts: string[] = [];
            variable.forEachChild(node => {
                if (Node.isIdentifier(node))
                    variable.setType("any");
                nodeTexts.push(node.getText());
            });

            expect(nodeTexts).to.deep.equal([
                "t",
                "5"
            ]);
        });

        it("should not go over a node that was deleted on a previous iteration", () => {
            const { sourceFile } = getInfoFromText("const t = 5;");
            const variable = sourceFile.getVariableDeclarationOrThrow("t");
            const nodeTexts: string[] = [];
            variable.forEachChild(node => {
                if (Node.isIdentifier(node))
                    variable.removeInitializer();
                nodeTexts.push(node.getText());
            });

            expect(nodeTexts).to.deep.equal([
                "t"
            ]);
        });
    });

    describe(nameof<Node>(n => n.forEachDescendant), () => {
        function doNodeCbSyntaxKindTest(
            node: Node,
            expectedKinds: SyntaxKind[],
            callback?: (node: Node, stop: ForEachDescendantTraversalControl) => unknown,
            expectedReturnValue?: Node
        ) {
            const foundKinds: SyntaxKind[] = [];
            const returnValue = node.forEachDescendant<unknown>((child, traversal) => {
                foundKinds.push(child.getKind());
                if (callback) {
                    const result = callback(child, traversal);
                    if (result)
                        return result;
                }
            });
            expect(foundKinds).to.deep.equal(expectedKinds);
            expect(returnValue).to.deep.equal(expectedReturnValue);
        }

        it("should iterate over all the descendants of a source file", () => {
            const { sourceFile } = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.InterfaceDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.EndOfFileToken
            ]);
        });

        it("should iterate until stop is called when at the child level", () => {
            const { sourceFile } = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.InterfaceDeclaration
            ], (node, traversal) => {
                if (node.getKind() === SyntaxKind.InterfaceDeclaration)
                    traversal.stop();
            });
        });

        it("should iterate until stop is called when at the grandchild level", () => {
            const { sourceFile } = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier
            ], (node, traversal) => {
                if (node.getKind() === SyntaxKind.Identifier)
                    traversal.stop();
            });
        });

        it("should iterate until a node is returned", () => {
            const { sourceFile } = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier
            ], node => {
                if (node.getKind() === SyntaxKind.Identifier)
                    return node;
                return undefined;
            }, sourceFile.getClasses()[0].getNameNodeOrThrow());
        });

        it("should skip looking at the descendants when calling skip", () => {
            const { sourceFile } = getInfoFromText("class Test { prop: string; } interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.InterfaceDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.EndOfFileToken
            ], (node, traversal) => {
                if (node.getKind() === SyntaxKind.ClassDeclaration)
                    traversal.skip();
            });
        });

        it("should go up to the parent when calling up", () => {
            const { sourceFile } = getInfoFromText("class Test { prop: string; prop2: string; } interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.PropertyDeclaration,
                SyntaxKind.InterfaceDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.EndOfFileToken
            ], (node, traversal) => {
                if (node.getKind() === SyntaxKind.PropertyDeclaration)
                    traversal.up();
            });
        });

        function doNodeArrayCbSyntaxKindTest(
            node: Node,
            expectedNodeKinds: SyntaxKind[],
            expectedArrayKinds: SyntaxKind[][],
            arrayCallback?: (children: Node[], traversal: ForEachDescendantTraversalControl) => unknown,
            nodeCallback?: (node: Node, traversal: ForEachDescendantTraversalControl) => unknown,
            expectedReturnValue?: Node
        ) {
            const foundNodeKinds: SyntaxKind[] = [];
            const foundArrayKinds: SyntaxKind[][] = [];
            const returnValue = node.forEachDescendant<unknown>((child, traversal) => {
                foundNodeKinds.push(child.getKind());
                if (nodeCallback) {
                    const result = nodeCallback(child, traversal);
                    if (result)
                        return result;
                }
            }, (childArray, traversal) => {
                foundArrayKinds.push(childArray.map(c => c.getKind()));
                if (arrayCallback) {
                    const result = arrayCallback(childArray, traversal);
                    if (result)
                        return result;
                }
            });

            expect(foundNodeKinds).to.deep.equal(expectedNodeKinds);
            expect(foundArrayKinds).to.deep.equal(expectedArrayKinds);
            expect(returnValue).to.deep.equal(expectedReturnValue);
        }

        it("should iterate all the descendants when using an array callback", () => {
            const { sourceFile } = getInfoFromText("export class Test { prop; method() {} } interface Test { prop; }");
            doNodeArrayCbSyntaxKindTest(
                sourceFile,
                [SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.Block, SyntaxKind.Identifier, SyntaxKind.Identifier,
                    SyntaxKind.EndOfFileToken],
                [
                    [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration],
                    [SyntaxKind.ExportKeyword],
                    [SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration],
                    [SyntaxKind.PropertySignature]
                ]
            );
        });

        it("should stop iteration when calling stop in an array callback at the child level", () => {
            const { sourceFile } = getInfoFromText("export class Test { prop: string; method() {} } interface Test { prop: string; }");
            doNodeArrayCbSyntaxKindTest(sourceFile, [], [
                [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration]
            ], (nodes, traversal) => {
                if (nodes.some(n => n.getKind() === SyntaxKind.ClassDeclaration))
                    traversal.stop();
            });
        });

        it("should stop iteration when calling stop in an array callback at the grandchild level", () => {
            const { sourceFile } = getInfoFromText("export class Test { prop: string; method() {} } interface Test { prop: string; }");
            doNodeArrayCbSyntaxKindTest(sourceFile, [SyntaxKind.Identifier], [
                [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration],
                [SyntaxKind.ExportKeyword],
                [SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]
            ], (nodes, traversal) => {
                if (nodes.some(n => n.getKind() === SyntaxKind.PropertyDeclaration))
                    traversal.stop();
            });
        });

        it("should return a value from the array callback", () => {
            const { sourceFile } = getInfoFromText("export class Test { prop: string; method() {} } interface Test { prop: string; }");
            doNodeArrayCbSyntaxKindTest(sourceFile, [SyntaxKind.Identifier], [
                [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration],
                [SyntaxKind.ExportKeyword],
                [SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]
            ], nodes => {
                return nodes.find(n => n.getKind() === SyntaxKind.PropertyDeclaration);
            }, undefined, sourceFile.getClassOrThrow("Test").getPropertyOrThrow("prop"));
        });

        it("should skip looking at the descendants when calling skip on an array callback", () => {
            const { sourceFile } = getInfoFromText("class Test { prop: string; prop2: string; } interface Interface { prop: string; }");
            doNodeArrayCbSyntaxKindTest(
                sourceFile,
                [SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.StringKeyword, SyntaxKind.EndOfFileToken],
                [
                    [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration],
                    [SyntaxKind.PropertyDeclaration, SyntaxKind.PropertyDeclaration],
                    [SyntaxKind.PropertySignature]
                ],
                (nodes, traversal) => {
                    if (nodes.some(n => n.getKind() === SyntaxKind.PropertyDeclaration))
                        traversal.skip();
                }
            );
        });

        it("should go up to the parent when calling up", () => {
            const { sourceFile } = getInfoFromText("class Test { prop: string; prop2: string; } interface Interface { prop: string; }");
            doNodeArrayCbSyntaxKindTest(
                sourceFile,
                [SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.StringKeyword, SyntaxKind.EndOfFileToken],
                [
                    [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration],
                    [SyntaxKind.PropertySignature]
                ],
                undefined,
                (node, traversal) => {
                    if (node.getText() === "Test")
                        traversal.up();
                }
            );
        });

        it("should be able to modify nodes midway through", () => {
            const { sourceFile } = getInfoFromText("const t = 5;");
            const nodeTexts: string[] = [];
            sourceFile.forEachDescendant(node => {
                if (Node.isTypedNode(node))
                    node.setType("any");
                nodeTexts.push(node.getText());
            });

            expect(nodeTexts).to.deep.equal([
                "const t = 5;",
                "const t = 5",
                "t: any = 5",
                "t",
                "any",
                "5",
                "" // end of file token
            ]);
        });

        it("should not go over a node that was deleted on a previous iteration", () => {
            const { sourceFile } = getInfoFromText("let t: any = 5;");
            const nodeTexts: string[] = [];
            sourceFile.forEachDescendant(node => {
                if (Node.isInitializerExpressionableNode(node))
                    node.removeInitializer();
                if (Node.isTypedNode(node))
                    node.removeType();
                nodeTexts.push(node.getText());
            });

            expect(nodeTexts).to.deep.equal([
                "let t: any = 5;",
                "let t: any = 5",
                "t",
                "t",
                "" // end of file token
            ]);
        });

        it("should not error when the current node is forgotten/removed", () => {
            const { sourceFile } = getInfoFromText("class Test {} interface Test2 {}");
            const nodeTexts: string[] = [];
            sourceFile.forEachDescendant(node => {
                nodeTexts.push(node.getText());
                if (Node.isClassDeclaration(node))
                    node.remove();
            });

            expect(nodeTexts).to.deep.equal([
                "class Test {}",
                "interface Test2 {}",
                "Test2",
                "" // end of file token
            ]);
        });
    });

    describe(nameof<Node>(n => n.forEachChildAsArray), () => {
        function runTest(startText: string, selectNode: (sourceFile: SourceFile) => Node, expectedKinds: SyntaxKind[]) {
            const { sourceFile } = getInfoFromText(startText);
            const node = selectNode(sourceFile);
            const foundKinds = node.forEachChildAsArray().map(c => c.getKind());
            expect(foundKinds).to.deep.equal(expectedKinds);
        }

        it("should iterate over all the children of a source file", () => {
            runTest(
                "class T {} interface I {}",
                sourceFile => sourceFile,
                [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration, SyntaxKind.EndOfFileToken]
            );
        });

        it("should not return comment nodes", () => {
            runTest(
                "// testing\nclass T {}",
                sourceFile => sourceFile,
                [SyntaxKind.ClassDeclaration, SyntaxKind.EndOfFileToken]
            );
        });

        it("should iterate over all the children of a class declaration", () => {
            runTest(
                "class T { prop1: string; prop2: number; }",
                sourceFile => sourceFile.getClassOrThrow("T"),
                [SyntaxKind.Identifier, SyntaxKind.PropertyDeclaration, SyntaxKind.PropertyDeclaration]
            );
        });
    });

    describe(nameof<Node>(n => n.forEachDescendantAsArray), () => {
        function runTest(startText: string, selectNode: (sourceFile: SourceFile) => Node, expectedKinds: SyntaxKind[]) {
            const { sourceFile } = getInfoFromText(startText);
            const node = selectNode(sourceFile);
            const foundKinds = node.forEachDescendantAsArray().map(c => c.getKind());
            expect(foundKinds).to.deep.equal(expectedKinds);
        }

        it("should iterate over all the descendants of a source file", () => {
            runTest(
                "class T {} interface I {}",
                sourceFile => sourceFile,
                [SyntaxKind.ClassDeclaration, SyntaxKind.Identifier, SyntaxKind.InterfaceDeclaration, SyntaxKind.Identifier, SyntaxKind.EndOfFileToken]
            );
        });
    });

    describe(nameof<Node>(n => n.getNodeProperty), () => {
        const fileText = "class MyClass<T, U> { prop: string; otherProp: number; } interface MyInterface {} export default class { prop: Date; }";
        const { firstChild: classDec, sourceFile } = getInfoFromText<ClassDeclaration>(fileText);
        const interfaceDec = sourceFile.getInterfaceOrThrow("MyInterface");
        const noNameClassDec = sourceFile.getClassOrThrow(c => c.getName() == null);

        it("should possibly return undefined for a nullable node property", () => {
            const result = classDec.getNodeProperty("name");
            assert<IsNullable<typeof result>>(true);
        });

        it("should not possibly return undefined for a non-nullable node property", () => {
            const result = interfaceDec.getNodeProperty("name");
            assert<IsExact<typeof result, Identifier>>(true);
            assert<IsNullable<typeof result>>(false);
        });

        it("should return a wrapped nullable node property of a node", () => {
            const name = classDec.getNodeProperty("name");
            assert<IsExact<typeof name, Identifier | undefined>>(true);
            expect(name!.getText()).to.equal("MyClass");
        });

        it("should return undefined when it's undefined", () => {
            const name = noNameClassDec.getNodeProperty("name");
            expect(name).to.be.undefined;
        });

        it("should return the property value when not a node", () => {
            const kind = classDec.getNodeProperty("kind");
            assert<IsExact<typeof kind, SyntaxKind.ClassDeclaration>>(true);
            expect(kind).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should return the node array wrapped", () => {
            const typeParameters = classDec.getNodeProperty("typeParameters");
            assert<IsNullable<typeof typeParameters>>(true);
            assert<IsExact<typeof typeParameters, TypeParameterDeclaration[] | undefined>>(true);
            expect(typeParameters![0].getDescendants().length).to.equal(1); // try a wrapped node property
        });
    });

    describe(nameof<Node>(n => n._getTrailingTriviaNonWhitespaceEnd), () => {
        it("should get the non whitespace end for a jsx child syntax list", () => {
            let code = "const v = (<div>\n    <div />";
            const expectedNonWhitepsaceEnd = code.length;
            code += "  \n";
            const expectedTriviaEnd = code.length;
            code += "</div>)";
            const { sourceFile } = getInfoFromText<VariableStatement>(code, { isJsx: true });
            const element = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.JsxElement);
            const syntaxList = element.getChildSyntaxListOrThrow();

            expect(syntaxList._getTrailingTriviaNonWhitespaceEnd()).to.equal(expectedNonWhitepsaceEnd);
            expect(syntaxList.getTrailingTriviaEnd()).to.equal(expectedTriviaEnd);
        });
    });

    describe(nameof<Node>(n => n.forget), () => {
        it("should throw an error when using a forgotten node", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member }");
            const member = firstChild.getMembers()[0];
            member.forget();
            expect(member.wasForgotten()).to.be.true;
            expect(() => member.compilerNode).to.throw(errors.InvalidOperationError, getExpectedForgottenMessage("member"));
        });
    });

    describe(nameof<Node>(n => n.forgetDescendants), () => {
        it("should only forget the descendants", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member }");
            const member = firstChild.getMembers()[0];
            firstChild.forgetDescendants();
            expect(member.wasForgotten()).to.be.true;
            expect(firstChild.wasForgotten()).to.be.false;
            expect(() => member.compilerNode).to.throw(errors.InvalidOperationError, getExpectedForgottenMessage("member"));
        });
    });

    function getExpectedForgottenMessage(nodeText: string) {
        return `Attempted to get information from a node that was removed or forgotten.\n\nNode text: ${nodeText}`;
    }

    describe(nameof<Node>(n => n.getNonWhitespaceStart), () => {
        function doTest(text: string, selectNode: (sourceFile: SourceFile) => Node, expected: number) {
            const { sourceFile } = getInfoFromText(text);
            const node = selectNode(sourceFile);
            expect(node.getNonWhitespaceStart()).to.equal(expected);
        }

        // todo: more tests

        it("should include the jsdocs if a node with jsdocs", () => {
            doTest("/** test */declare function test() {}", sourceFile => sourceFile.getFunctions()[0], 0);
        });

        it("should not include jsdocs when the pos is before and the start is after", () => {
            doTest("/** test */declare function test() {}", sourceFile => sourceFile.getFunctions()[0].getModifiers()[0], 11);
        });

        it("should not include the comment when for a child with the same pos as the parent", () => {
            doTest("// testing\ndeclare function test() {}", sourceFile => sourceFile.getFunctions()[0].getModifiers()[0], 11);
        });

        it("should not include a comment node", () => {
            doTest("// testing\ndeclare function test() {}", sourceFile => sourceFile.getFunctions()[0], 11);
        });

        it("should include a comment on the same line", () => {
            doTest("/* a */ declare function test() {}", sourceFile => sourceFile.getFunctions()[0], 0);
        });
    });

    describe(nameof<Node>(n => n.transform), () => {
        function doTest(
            text: string,
            selectNode: (sourceFile: SourceFile) => Node,
            visitNode: (traversal: { visitChildren(): ts.Node; currentNode: ts.Node; }) => ts.Node,
            expectedText: string,
            additionalChecks?: (sourceFile: SourceFile) => void
        ) {
            const { sourceFile } = getInfoFromText(text);
            const node = selectNode(sourceFile);

            node.transform(visitNode);

            expect(sourceFile.getFullText()).to.equal(expectedText);

            if (additionalChecks)
                additionalChecks(sourceFile);
        }

        it("should transform a node to the same kind", () => {
            let firstNumericLiteral: NumericLiteral;
            doTest("1; 2; 3;", sourceFile => {
                sourceFile.getDescendants(); // force wrapping all the children
                firstNumericLiteral = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.NumericLiteral);
                return sourceFile;
            }, traversal => {
                const node = traversal.visitChildren();
                if (ts.isNumericLiteral(node))
                    return ts.createNumericLiteral((parseInt(node.text, 10) + 1).toString());
                return node;
            }, `2; 3; 4;`, sourceFile => {
                const literalValues = sourceFile.getStatements().map(s => ((s as ExpressionStatement).getExpression() as NumericLiteral).getLiteralValue());
                expect(literalValues).to.deep.equal([2, 3, 4]);
                expect(firstNumericLiteral!.wasForgotten()).to.be.false;
            });
        });

        it("should transform node to a different kind and forget the past nodes", () => {
            let firstNumericLiteral: NumericLiteral;
            doTest("1; 2; 3;", sourceFile => {
                sourceFile.getDescendants(); // force wrapping all the children
                firstNumericLiteral = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.NumericLiteral);
                return sourceFile;
            }, traversal => {
                const node = traversal.visitChildren();
                if (ts.isNumericLiteral(node))
                    return ts.createStringLiteral((parseInt(node.text, 10) + 1).toString());
                return node;
            }, `"2"; "3"; "4";`, sourceFile => {
                const literalValues = sourceFile.getStatements().map(s => ((s as ExpressionStatement).getExpression() as StringLiteral).getLiteralValue());
                expect(literalValues).to.deep.equal(["2", "3", "4"]);
                expect(firstNumericLiteral!.wasForgotten()).to.be.true;
            });
        });

        it("should allow updating the node", () => {
            let throwStatement: Node;
            let newExpression: Node;
            doTest("throw new Error();", sourceFile => {
                sourceFile.getDescendants(); // force wrapping all the children
                throwStatement = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ThrowStatement);
                newExpression = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.NewExpression);
                return sourceFile;
            }, traversal => {
                const node = traversal.visitChildren();
                if (ts.isThrowStatement(node))
                    return ts.updateThrow(node, ts.createStringLiteral("test"));
                return node;
            }, `throw "test";`, () => {
                expect(throwStatement!.wasForgotten()).to.be.false;
                expect(newExpression!.wasForgotten()).to.be.true;
            });
        });

        it("should allow transforming only a portion of the ast", () => {
            doTest("class C {} class B {}", sourceFile => sourceFile.getClassOrThrow("C"), traversal => {
                const node = traversal.visitChildren();
                if (ts.isClassDeclaration(node))
                    return ts.createInterfaceDeclaration(undefined, undefined, "A", undefined, undefined, []);
                return node;
            }, `interface A {\n} class B {}`);
        });

        it("should handle comments", () => {
            doTest("// test\nclass C {}\n// test2\nclass B {}", sourceFile => sourceFile, traversal => {
                const node = traversal.visitChildren();
                if (ts.isClassDeclaration(node))
                    return ts.createInterfaceDeclaration(undefined, undefined, "A", undefined, undefined, []);
                return node;
            }, `// test\ninterface A {\n}\n// test2\ninterface A {\n}`);
        });

        it("should handle jsdocs when replacing", () => {
            doTest("/** Testing */\nclass C {}", sourceFile => sourceFile, traversal => {
                const node = traversal.visitChildren();
                if (ts.isClassDeclaration(node))
                    return ts.createInterfaceDeclaration(undefined, undefined, "A", undefined, undefined, []);
                return node;
            }, `interface A {\n}`);
        });

        it("should handle jsdocs when updating", () => {
            doTest("/** Testing */\nexport class C {}", sourceFile => sourceFile, traversal => {
                const node = traversal.visitChildren();
                if (ts.isClassDeclaration(node))
                    return ts.updateClassDeclaration(node, undefined, undefined, ts.createIdentifier("A"), undefined, undefined, []);
                return node;
            }, `/** Testing */\nclass A {\n}`);
        });
    });

    describe(nameof<Node>(n => n.getLocals), () => {
        function doTest(text: string, expectedLocalNames: string[]) {
            const { sourceFile } = getInfoFromText(text);
            expect(sourceFile.getLocals().map(l => l.getName())).to.deep.equal(expectedLocalNames);
        }

        it("should get all the locals in the source file scope", () => {
            doTest("const t = 5;\nclass U {}\ninterface I", ["t", "U", "I"]);
        });
    });

    describe(nameof<Node>(n => n.getLocal), () => {
        function doTest(text: string, name: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const result = sourceFile.getLocal(name);
            expect(result && result.getName() || undefined).to.equal(expectedName);
        }

        it("should get the local by name", () => {
            doTest("const t = 5;\nclass U {}\ninterface I", "t", "t");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("const t = 5;\nclass U {}\ninterface I", "m", undefined);
        });
    });

    describe(nameof<Node>(n => n.getLocalOrThrow), () => {
        function doTest(text: string, name: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            if (expectedName == null)
                expect(() => sourceFile.getLocalOrThrow(name)).to.throw();
            else
                expect(sourceFile.getLocalOrThrow(name).getName()).to.equal(expectedName);
        }

        it("should get the local by name", () => {
            doTest("const t = 5;\nclass U {}\ninterface I", "t", "t");
        });

        it("should throw when it doesn't exist", () => {
            doTest("const t = 5;\nclass U {}\ninterface I", "m", undefined);
        });
    });

    describe(nameof<Node>(n => n.getSymbolsInScope), () => {
        function doTest(text: string, selectNode: (sourceFile: SourceFile) => Node, meaning: SymbolFlags, expectedSymbolNames: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const node = selectNode(sourceFile);
            const result = node.getSymbolsInScope(meaning);
            expect(result.map(s => s.getName()).sort()).to.deep.equal(expectedSymbolNames.sort());
        }

        it("should get all the symbols in the provided scope filtered by meaning", () => {
            doTest(
                "const var = 5; function a() { function b() {} const c = ''; function e() { function f() {} } }",
                sourceFile => sourceFile.getFunctionOrThrow("a").getVariableDeclarationOrThrow("c"),
                SymbolFlags.BlockScopedVariable,
                ["c"]
            );
        });
    });
});
