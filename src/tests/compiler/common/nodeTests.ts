import CodeBlockWriter from "code-block-writer";
import { expect } from "chai";
import { ts, SyntaxKind, NewLineKind } from "../../../typescript";
import { Node, EnumDeclaration, ClassDeclaration, FunctionDeclaration, InterfaceDeclaration, PropertySignature, PropertyAccessExpression,
    SourceFile, FormatCodeSettings, CallExpression } from "../../../compiler";
import * as errors from "../../../errors";
import { TypeGuards } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

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
            const {sourceFile} = getInfoFromText("enum MyEnum {}\n");
            // just compare that the texts are the same
            expect(sourceFile.getFullText()).to.equal(sourceFile.compilerNode.getFullText());
        });

        it("should throw an error when using a removed node", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member }\n");
            const member = firstChild.getMembers()[0];
            member.remove();
            expect(() => member.compilerNode).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getKind), () => {
        it("should return the syntax kind", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKind()).to.equal(SyntaxKind.EnumDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getKindName), () => {
        it("should return the syntax kind name", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKindName()).to.equal("EnumDeclaration");
        });
    });

    describe(nameof<Node>(n => n.containsRange), () => {
        const {firstChild} = getInfoFromText("enum MyEnum {}");
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
            const {sourceFile} = getInfoFromText(text);
            for (let i = 0; i < isInStringAtPos.length; i++) {
                expect(sourceFile.isInStringAtPos(i)).to.equal(isInStringAtPos[i], `should be equal at index ${i}`);
            }
        }

        it("should be within a double quote string when it is", () => {
            doTest(`"t"`, [false, true, false, false]);
        });

        it("should be within a single quote string when it is", () => {
            doTest(`'t'`, [false, true, false, false]);
        });

        it("should be within a tagged template string when it is", () => {
            doTest("`t${v}" + "t${u}t`", [
                false, true, true, false, false, false,
                true, true, false, false, false, true, false, false]);
        });

        it("should throw when specifying a pos less than 0", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.isInStringAtPos(-1)).to.throw();
        });

        it("should throw when specifying a pos greater than the length of the file", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.isInStringAtPos(1)).to.throw();
        });

        it("should clear the list of cached nodes after manipulating", () => {
            const {sourceFile} = getInfoFromText(`"t"`);
            expect(sourceFile.isInStringAtPos(3)).to.be.false;
            sourceFile.replaceText([1, 1], "new text");
            expect(sourceFile.isInStringAtPos(3)).to.be.true;
        });
    });

    describe(nameof<Node>(n => n.offsetPositions), () => {
        const {sourceFile} = getInfoFromText("enum MyEnum {}");
        const allNodes = [sourceFile, ...sourceFile.getDescendants()];

        // easiest to just compare the sum of the positions
        const originalStartPosSum = allNodes.map(n => n.getPos()).reduce((a, b) => a + b, 0);
        const originalEndPosSum = allNodes.map(n => n.getEnd()).reduce((a, b) => a + b, 0);
        it("should offset all the positions", () => {
            sourceFile.offsetPositions(5);
            const adjustedStartPosSum = allNodes.map(n => n.getPos() - 5).reduce((a, b) => a + b, 0);
            const adjustedEndPosSum = allNodes.map(n => n.getEnd() - 5).reduce((a, b) => a + b, 0);
            expect(adjustedStartPosSum).to.equal(originalStartPosSum);
            expect(adjustedEndPosSum).to.equal(originalEndPosSum);
        });
    });

    describe(nameof<Node>(n => n.getFirstChildIfKind), () => {
        const {firstChild} = getInfoFromText("enum MyEnum {}");

        it("should return the first node if its the specified syntax kind", () => {
            expect(firstChild.getFirstChildIfKind(SyntaxKind.EnumKeyword)!.getText()).to.equal("enum");
        });

        it("should return undefined when the specified syntax kind isn't the first child", () => {
            expect(firstChild.getFirstChildIfKind(SyntaxKind.AbstractKeyword)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getFirstChildIfKindOrThrow), () => {
        const {firstChild} = getInfoFromText("enum MyEnum {}");

        it("should return the first node if its the specified syntax kind", () => {
            expect(firstChild.getFirstChildIfKindOrThrow(SyntaxKind.EnumKeyword).getText()).to.equal("enum");
        });

        it("should return undefined when the specified syntax kind isn't the first child", () => {
            expect(() => firstChild.getFirstChildIfKindOrThrow(SyntaxKind.AbstractKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getFirstChildByKind), () => {
        const {firstChild} = getInfoFromText("enum MyEnum {}");

        it("should return the first node of the specified syntax kind", () => {
            expect(firstChild.getFirstChildByKind(SyntaxKind.OpenBraceToken)!.getText()).to.equal("{");
        });

        it("should return undefined when the specified syntax kind doesn't exist", () => {
            expect(firstChild.getFirstChildByKind(SyntaxKind.ClassDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getChildAtPos), () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() { const v = 5; }");
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
        const {sourceFile} = getInfoFromText("class Class { } interface Interface {}");
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
        const {sourceFile} = getInfoFromText("class Class { }");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the child at the specified index when the kind", () => {
            expect(syntaxList.getChildAtIndexIfKind(0, SyntaxKind.ClassDeclaration)!.getKind()).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should be undefined when specifying the wrong kind", () => {
            expect(syntaxList.getChildAtIndexIfKind(0, SyntaxKind.InterfaceDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getChildAtIndexIfKindOrThrow), () => {
        const {sourceFile} = getInfoFromText("class Class { }");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the child at the specified index when the kind", () => {
            expect(syntaxList.getChildAtIndexIfKindOrThrow(0, SyntaxKind.ClassDeclaration).getKind()).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should be undefined when specifying the wrong kind", () => {
            expect(() => syntaxList.getChildAtIndexIfKindOrThrow(0, SyntaxKind.InterfaceDeclaration)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getDescendantAtPos), () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() { const v = 5; }");
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
            const {sourceFile} = getInfoFromText(text);
            expect(sourceFile.getDescendantStatements().map(s => s.getText())).to.deep.equal(expectedStatements);
        }

        it("should get the descendant statements", () => {
            const expected = [
                `const a = () => {\n    const b = "";\n};`,
                `const b = "";`,
                `const c = 5;`,
                `function d() {\n    function e() {\n        const f = "";\n    }\n}`,
                `function e() {\n        const f = "";\n    }`,
                `const f = "";`,
                `class MyClass {\n    prop = () => console.log("here");\n}`,
                `console.log("here")`
            ];
            doTest(`const a = () => {
    const b = "";
};
const c = 5;
function d() {
    function e() {
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
            const {firstChild} = getInfoFromText(text);
            expect(firstChild.getStartLinePos(includeJsDocComment)).to.equal(expectedPos);
        }

        it("should return the start of the file when it's on the first line", () => {
            doTest("enum MyEnum {\n}\n", 0);
        });

        it("should return the start of the file when it's on the first line", () => {
            doTest("    enum MyEnum {\n}\n", 0);
        });

        it("should return the start of the line when it's not on the first line", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {\n    myMember = 1\n}\n");
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
            const {firstChild} = getInfoFromText<ClassDeclaration>("\n\nclass MyClass {\n\n    prop: string;\n}");
            expect(firstChild.getInstanceProperties()[0].getStartLineNumber()).to.equal(5);
        });
    });

    describe(nameof<Node>(n => n.getEndLineNumber), () => {
        it("should get the end line number of the node", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("\n\nclass MyClass {\n\n    prop: string;\n}");
            expect(firstChild.getEndLineNumber()).to.equal(6);
        });
    });

    describe(nameof<Node>(n => n.getStart), () => {
        function doTest(text: string, expectedPos: number, includeJsDocComment?: boolean) {
            const {firstChild} = getInfoFromText(text);
            expect(firstChild.getStart(includeJsDocComment)).to.equal(expectedPos);
        }

        it("should return the pos without trivia", () => {
            doTest("\n  \t  /* comment */ //comment  \r\n  \t enum MyEnum {\n}\n", 37);
        });

        it("should return the pos at the start of the js doc comment if specified", () => {
            doTest("/**\n * Test\n */\nenum MyEnum {\n}\n", 0, true);
        });
    });

    describe(nameof<Node>(n => n.getCombinedModifierFlags), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        it("should get the combined modifier flags", () => {
            expect(firstChild.getCombinedModifierFlags()).to.equal(ts.ModifierFlags.Export);
        });
    });

    describe(nameof<Node>(n => n.getParentIfKind), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it's the right kind", () => {
            expect(child.getParentIfKind(SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should not get the parent when it's not the right kind", () => {
            expect(child.getParentIfKind(SyntaxKind.InterfaceDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getParentIfKindOrThrow), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it's the right kind", () => {
            expect(child.getParentIfKindOrThrow(SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should throw when it's not the right kind", () => {
            expect(() => child.getParentIfKindOrThrow(SyntaxKind.InterfaceDeclaration)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getParentWhile), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const {sourceFile} = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhile(n => n.getKind() === SyntaxKind.PropertyAccessExpression)!;
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const {sourceFile} = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(child.getParentWhile(() => false)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getParentWhileOrThrow), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const {sourceFile} = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhileOrThrow(n => n.getKind() === SyntaxKind.PropertyAccessExpression);
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const {sourceFile} = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(() => child.getParentWhileOrThrow(() => false)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getParentWhileKind), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const {sourceFile} = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhileKind(SyntaxKind.PropertyAccessExpression)!;
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const {sourceFile} = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(child.getParentWhileKind(SyntaxKind.PrivateKeyword)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getParentWhileKindOrThrow), () => {
        it("should keep getting the parent until a condition is no longer matched", () => {
            const {sourceFile} = getInfoFromText("const t = Test.Test2.Test3.Test4;");
            const deepestNode = sourceFile.getFirstDescendantOrThrow(n => n.getText() === "Test");
            const topParent = deepestNode.getParentWhileKindOrThrow(SyntaxKind.PropertyAccessExpression);
            expect(topParent.getText()).to.equal("Test.Test2.Test3.Test4");
        });

        it("should return undefined when the initial parent doesn't match the condition", () => {
            const {sourceFile} = getInfoFromText("const t;");
            const child = sourceFile.getVariableStatements()[0];
            expect(() => child.getParentWhileKindOrThrow(SyntaxKind.PrivateKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getFirstChildOrThrow), () => {
        const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>("class Identifier { prop: string; }\ninterface MyInterface {}");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the first child by a condition", () => {
            expect(syntaxList.getFirstChildOrThrow(n => n.getKind() === SyntaxKind.InterfaceDeclaration)).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should throw when it can't find the child", () => {
            expect(() => syntaxList.getFirstChildOrThrow(n => n.getKind() === SyntaxKind.IsKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getLastChildOrThrow), () => {
        const {sourceFile} = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface {}");
        const syntaxList = sourceFile.getChildSyntaxListOrThrow();

        it("should get the last child by a condition", () => {
            const interfaceDec = syntaxList.getLastChildOrThrow(n => n.getKind() === SyntaxKind.InterfaceDeclaration) as InterfaceDeclaration;
            expect(interfaceDec.getName()).to.equal("MyInterface");
        });

        it("should throw when it can't find the child", () => {
            expect(() => syntaxList.getLastChildOrThrow(n => n.getKind() === SyntaxKind.IsKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendant), () => {
        const {sourceFile} = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

        it("should get the first descendant by a condition", () => {
            const prop = sourceFile.getFirstDescendant(n => n.getKind() === SyntaxKind.PropertySignature);
            expect(prop).to.be.instanceOf(PropertySignature);
            expect((prop as PropertySignature).getName()).to.equal("prop");
        });

        it("should return undefined when it can't find it", () => {
            const privateKeyword = sourceFile.getFirstDescendant(n => n.getKind() === SyntaxKind.PrivateKeyword);
            expect(privateKeyword).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendantOrThrow), () => {
        const {sourceFile} = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

        it("should get the first descendant by a condition", () => {
            const prop = sourceFile.getFirstDescendantOrThrow(n => n.getKind() === SyntaxKind.PropertySignature);
            expect(prop).to.be.instanceOf(PropertySignature);
            expect((prop as PropertySignature).getName()).to.equal("prop");
        });

        it("should return undefined when it can't find it", () => {
            expect(() => sourceFile.getFirstDescendantOrThrow(n => n.getKind() === SyntaxKind.PrivateKeyword)).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getDescendantsOfKind), () => {
        const {sourceFile} = getInfoFromText("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

        it("should get the descendant by a kind", () => {
            const properties = sourceFile.getDescendantsOfKind(SyntaxKind.PropertySignature);
            expect(properties.length).to.equal(2);
            expect(properties[0]).to.be.instanceOf(PropertySignature);
            expect(properties[1]).to.be.instanceOf(PropertySignature);
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendantByKind), () => {
        const {sourceFile} = getInfoFromText<ClassDeclaration>("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

        it("should get the first descendant by a condition", () => {
            const prop = sourceFile.getFirstDescendantByKind(SyntaxKind.PropertySignature);
            expect(prop).to.be.instanceOf(PropertySignature);
            expect((prop as PropertySignature).getName()).to.equal("prop");
        });

        it("should return undefined when it can't find it", () => {
            const privateKeyword = sourceFile.getFirstDescendantByKind(SyntaxKind.PrivateKeyword);
            expect(privateKeyword).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getFirstDescendantByKindOrThrow), () => {
        const {sourceFile} = getInfoFromText("interface Identifier { prop: string; }\ninterface MyInterface { nextProp: string; }");

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
        const {sourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSibling(s => TypeGuards.isInterfaceDeclaration(s) && s.getName() === "Interface1")!.getText())
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
    });

    describe(nameof<Node>(n => n.getPreviousSiblingOrThrow), () => {
        const {sourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSiblingOrThrow(s => TypeGuards.isInterfaceDeclaration(s) && s.getName() === "Interface1").getText())
                .to.equal("interface Interface1 {}");
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
    });

    describe(nameof<Node>(n => n.getNextSibling), () => {
        const {sourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the next sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[0].getNextSibling(s => TypeGuards.isInterfaceDeclaration(s) && s.getName() === "Interface3")!.getText())
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
    });

    describe(nameof<Node>(n => n.getNextSiblingOrThrow), () => {
        const {sourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the next sibling based on a condition", () => {
            expect(sourceFile.getInterfaces()[0].getNextSiblingOrThrow(s => TypeGuards.isInterfaceDeclaration(s) && s.getName() === "Interface3").getText())
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
    });

    describe(nameof<Node>(n => n.getPreviousSiblings), () => {
        const {sourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous siblings going away in order", () => {
            expect(sourceFile.getInterfaces()[2].getPreviousSiblings().map(s => (s as InterfaceDeclaration).getName()))
                .to.deep.equal(["Interface2", "Interface1"]);
        });
    });

    describe(nameof<Node>(n => n.getNextSiblings), () => {
        const {sourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}\ninterface Interface3 {}");

        it("should get the previous siblings going away in order", () => {
            expect(sourceFile.getInterfaces()[0].getNextSiblings().map(s => (s as InterfaceDeclaration).getName()))
                .to.deep.equal(["Interface2", "Interface3"]);
        });
    });

    describe(nameof<Node>(n => n.isFirstNodeOnLine), () => {
        function doTest(text: string, index: number, expected: boolean) {
            const {sourceFile} = getInfoFromText(text);
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
        function doTest(startText: string, replaceText: string | ((writer: CodeBlockWriter) => void), expectedText: string) {
            const {sourceFile} = getInfoFromText(startText);
            const varDeclaration = sourceFile.getVariableDeclarations()[0];
            const propAccess = (varDeclaration.getInitializerOrThrow() as PropertyAccessExpression);
            let newNode: Node;
            if (typeof replaceText === "string")
                newNode = propAccess.replaceWithText(replaceText);
            else
                newNode = propAccess.replaceWithText(replaceText);
            expect(newNode.getText()).to.equal(getReplaceTextAsString());
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(() => propAccess.compilerNode).to.throw(); // should be forgotten

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
            const {sourceFile} = getInfoFromText("var t = Some.Prop.Access;");
            const result = sourceFile.replaceWithText("var t;");
            expect(sourceFile.getFullText()).to.equal("var t;"); // in this case, it will not forget the source file
            expect(result).to.equal(sourceFile);
        });

        it("should replace the jsdoc text", () => {
            const {firstChild, sourceFile} = getInfoFromText("/**\n * Testing\n */\nclass MyClass {}");
            const result = firstChild.replaceWithText("var t;");
            expect(sourceFile.getFullText()).to.equal("var t;");
            expect(result).to.equal(sourceFile.getStatements()[0]);
        });

        it("should replace midway through a prop access expression", () => {
            const {sourceFile} = getInfoFromText("var t = this.writer.space();");
            const varDeclaration = sourceFile.getVariableDeclarations()[0];
            const propAccess = ((varDeclaration.getInitializerOrThrow() as CallExpression).getExpression() as PropertyAccessExpression).getExpression();
            propAccess.replaceWithText("writer");
            expect(sourceFile.getFullText()).to.equal("var t = writer.space();");
        });

        it("should throw when replacing with more than one node", () => {
            const {sourceFile} = getInfoFromText("var t = Some.Prop.Access;");
            const varDeclaration = sourceFile.getVariableDeclarations()[0];
            const propAccess = (varDeclaration.getInitializerOrThrow() as PropertyAccessExpression);
            expect(() => {
                propAccess.replaceWithText("SomeTest; Test");
            }).to.throw();
        });
    });

    describe(nameof<Node>(n => n.print), () => {
        const nodeText = "class MyClass {\n    // comment\n    prop: string;\n}";
        const {sourceFile, firstChild} = getInfoFromText(nodeText);

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
            const {sourceFile} = getInfoFromText(text);
            getNode(sourceFile).formatText(settings);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should format only the provided node", () => {
            doTest("class Test{\n   prop:string;\n  }\nclass Test2{\n   prop:string;\n  }\n", f => f.getClassOrThrow("Test2"),
                "class Test{\n   prop:string;\n  }\nclass Test2 {\n    prop: string;\n}\n");
        });

        it("should format only the provided node with the specified settings", () => {
            doTest("class Test{\n\tprop:string;\n}\n       /** Testing */\nclass Test2{\n\t prop:string;\n\t}\n", f => f.getClassOrThrow("Test2"),
                "class Test{\n\tprop:string;\n}\n/** Testing */\nclass Test2 {\n  prop: string;\n}\n", {
                    convertTabsToSpaces: true,
                    indentSize: 2
                });
        });
    });

    describe(nameof<Node>(n => n.getLeadingCommentRanges), () => {
        it("should return nothing for a source file", () => {
            const {sourceFile} = getInfoFromText("// before1\nvar t = 5;");
            expect(sourceFile.getLeadingCommentRanges().length).to.equal(0);
        });

        it("should get the leading comment ranges", () => {
            const {firstChild} = getInfoFromText("// before1\n// before2\n/* before3 */var t = 5; // after");
            expect(firstChild.getLeadingCommentRanges().map(r => r.getText())).to.deep.equal(["// before1", "// before2", "/* before3 */"]);
        });

        it("should forget the leading comment range after forgetting the node", () => {
            const {firstChild} = getInfoFromText("// before\nvar t = 5;");
            const commentRange = firstChild.getLeadingCommentRanges()[0];
            expect(commentRange).to.not.be.undefined;
            firstChild.forget();
            expect(commentRange.wasForgotten()).to.be.true;
            expect(() => commentRange.getText()).to.throw(errors.InvalidOperationError);
        });

        it("should forget a leading comment range after a manipulation", () => {
            const {firstChild, sourceFile} = getInfoFromText("// before\nvar t = 5;");
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
            const {firstChild} = getInfoFromText("// before\nvar t = 5; // after1\n// after2\n/* after3 */");
            expect(firstChild.getTrailingCommentRanges().map(r => r.getText())).to.deep.equal(["// after1"]);
        });

        it("should return the comment ranges for syntax kinds", () => {
            const {sourceFile} = getInfoFromText("var t = 5; /* testing */");
            expect(sourceFile.getChildSyntaxListOrThrow().getTrailingCommentRanges().map(r => r.getText())).to.deep.equal(["/* testing */"]);
        });

        it("should get the trailing comment ranges when there are multiple", () => {
            const {firstChild} = getInfoFromText("// before\nvar t = 5; /* after1 *//* after2 *//* after3 */");
            expect(firstChild.getTrailingCommentRanges().map(r => r.getText())).to.deep.equal(["/* after1 */", "/* after2 */", "/* after3 */"]);
        });

        it("should forget the trailing comment range after forgetting the node", () => {
            const {firstChild} = getInfoFromText("var t = 5; // after");
            const commentRange = firstChild.getTrailingCommentRanges()[0];
            expect(commentRange).to.not.be.undefined;
            firstChild.forget();
            expect(commentRange.wasForgotten()).to.be.true;
            expect(() => commentRange.getText()).to.throw(errors.InvalidOperationError);
        });

        it("should forget a trailing comment range after a manipulation", () => {
            const {firstChild, sourceFile} = getInfoFromText("var t = 5; // after");
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
            const {firstChild, sourceFile} = getInfoFromText(text);
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
    });

    describe(nameof<Node>(n => n.getTrailingTriviaWidth), () => {
        function doTest(text: string, expected: number) {
            const {firstChild, sourceFile} = getInfoFromText(text);
            expect(firstChild.getTrailingTriviaWidth()).to.equal(expected);
        }

        it("should get the trailing trivia width", () => {
            const startText = "var t = 5;";
            const triviaText = "\t  \t /* testing */  \t";
            doTest(startText + triviaText, triviaText.length);
        });
    });

    describe(nameof<Node>(n => n.forEachChild), () => {
        function doNodeCbSyntaxKindTest(node: Node, expectedKinds: SyntaxKind[], callback?: (child: Node, stop: () => void) => void) {
            const foundKinds: SyntaxKind[] = [];
            node.forEachChild((child, stop) => {
                foundKinds.push(child.getKind());
                if (callback)
                    callback(child, stop);
            });
            expect(foundKinds).to.deep.equal(expectedKinds);
        }

        it("should iterate over all the children of a source file", () => {
            const {sourceFile} = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration, SyntaxKind.EndOfFileToken]);
        });

        it("should iterate over all the children when it includes an array", () => {
            const {firstChild} = getInfoFromText("class Test { prop: string; method() {} }");
            doNodeCbSyntaxKindTest(firstChild, [SyntaxKind.Identifier, SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]);
        });

        it("should stop iteration when calling stop in a node callback", () => {
            const {firstChild} = getInfoFromText("class Test { prop: string; method() {} }");
            doNodeCbSyntaxKindTest(firstChild, [SyntaxKind.Identifier, SyntaxKind.PropertyDeclaration], (node, stop) => {
                if (node.getKind() === SyntaxKind.PropertyDeclaration)
                    stop();
            });
        });

        function doNodeArrayCbSyntaxKindTest(node: Node, expectedNodeKinds: SyntaxKind[], expectedArrayKinds: SyntaxKind[][], forceStop = false) {
            const foundNodeKinds: SyntaxKind[] = [];
            const foundArrayKinds: SyntaxKind[][] = [];
            node.forEachChild(child => foundNodeKinds.push(child.getKind()), (childArray, stop) => {
                foundArrayKinds.push(childArray.map(c => c.getKind()));
                if (forceStop)
                    stop();
            });

            expect(foundNodeKinds).to.deep.equal(expectedNodeKinds);
            expect(foundArrayKinds).to.deep.equal(expectedArrayKinds);
        }

        it("should iterate over all the children when it includes an array when using an array callback", () => {
            const {firstChild} = getInfoFromText("export class Test { prop: string; method() {} }");
            doNodeArrayCbSyntaxKindTest(firstChild, [SyntaxKind.Identifier], [
                [SyntaxKind.ExportKeyword],
                [SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]
            ]);
        });

        it("should stop iteration when calling stop in an array callback", () => {
            const {firstChild} = getInfoFromText("export class Test { prop: string; method() {} }");
            doNodeArrayCbSyntaxKindTest(firstChild, [], [[SyntaxKind.ExportKeyword]], true);
        });

        it("should not stop when both callbacks return values", () => {
            const {firstChild} = getInfoFromText("class Test { prop: string; method() {} }");
            const foundNodeKinds: SyntaxKind[] = [];
            const foundArrayKinds: SyntaxKind[][] = [];
            firstChild.forEachChild(node => foundNodeKinds.push(node.getKind()), nodeArray => foundArrayKinds.push(nodeArray.map(n => n.getKind())));
            expect(foundNodeKinds).to.deep.equal([SyntaxKind.Identifier]);
            expect(foundArrayKinds).to.deep.equal([[SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]]);
        });
    });

    describe(nameof<Node>(n => n.forEachDescendant), () => {
        function doNodeCbSyntaxKindTest(node: Node, expectedKinds: SyntaxKind[], callback?: (node: Node, stop: () => void) => void) {
            const foundKinds: SyntaxKind[] = [];
            node.forEachDescendant((child, stop) => {
                foundKinds.push(child.getKind());
                if (callback)
                    callback(child, stop);
            });
            expect(foundKinds).to.deep.equal(expectedKinds);
        }

        it("should iterate over all the descendants of a source file", () => {
            const {sourceFile} = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.InterfaceDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.EndOfFileToken
            ]);
        });

        it("should iterate until stop is called when at the child level", () => {
            const {sourceFile} = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier,
                SyntaxKind.InterfaceDeclaration
            ], (node, stop) => {
                if (node.getKind() === SyntaxKind.InterfaceDeclaration)
                    stop();
            });
        });

        it("should iterate until stop is called when at the grandchild level", () => {
            const {sourceFile} = getInfoFromText("class Test {} interface Interface {}");
            doNodeCbSyntaxKindTest(sourceFile, [
                SyntaxKind.ClassDeclaration,
                SyntaxKind.Identifier
            ], (node, stop) => {
                if (node.getKind() === SyntaxKind.Identifier)
                    stop();
            });
        });

        function doNodeArrayCbSyntaxKindTest(node: Node, expectedNodeKinds: SyntaxKind[], expectedArrayKinds: SyntaxKind[][], callback?: (children: Node[], stop: () => void) => void) {
            const foundNodeKinds: SyntaxKind[] = [];
            const foundArrayKinds: SyntaxKind[][] = [];
            node.forEachDescendant(child => foundNodeKinds.push(child.getKind()), (childArray, stop) => {
                foundArrayKinds.push(childArray.map(c => c.getKind()));
                if (callback)
                    callback(childArray, stop);
            });

            expect(foundNodeKinds).to.deep.equal(expectedNodeKinds);
            expect(foundArrayKinds).to.deep.equal(expectedArrayKinds);
        }

        it("should iterate all the descendants when using an array callback", () => {
            const {sourceFile} = getInfoFromText("export class Test { prop; method() {} } interface Test { prop; }");
            doNodeArrayCbSyntaxKindTest(sourceFile, [SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.Block,
                    SyntaxKind.Identifier, SyntaxKind.Identifier, SyntaxKind.EndOfFileToken], [
                [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration],
                [SyntaxKind.ExportKeyword],
                [SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration],
                [],
                [],
                [SyntaxKind.PropertySignature]
            ]);
        });

        it("should stop iteration when calling stop in an array callback at the child level", () => {
            const {sourceFile} = getInfoFromText("export class Test { prop: string; method() {} } interface Test { prop: string; }");
            doNodeArrayCbSyntaxKindTest(sourceFile, [], [
                [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration]
            ], (nodes, stop) => {
                if (nodes.some(n => n.getKind() === SyntaxKind.ClassDeclaration))
                    stop();
            });
        });

        it("should stop iteration when calling stop in an array callback at the grandchild level", () => {
            const {sourceFile} = getInfoFromText("export class Test { prop: string; method() {} } interface Test { prop: string; }");
            doNodeArrayCbSyntaxKindTest(sourceFile, [SyntaxKind.Identifier], [
                [SyntaxKind.ClassDeclaration, SyntaxKind.InterfaceDeclaration],
                [SyntaxKind.ExportKeyword],
                [SyntaxKind.PropertyDeclaration, SyntaxKind.MethodDeclaration]
            ], (nodes, stop) => {
                if (nodes.some(n => n.getKind() === SyntaxKind.PropertyDeclaration))
                    stop();
            });
        });
    });
});
