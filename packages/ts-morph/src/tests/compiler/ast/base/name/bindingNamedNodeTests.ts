import { expect } from "chai";
import { AssertTrue, IsExact } from "conditional-type-checks";
import { VariableStatement, BindingNamedNode, BindingName, Node } from "../../../../../compiler";
import { getInfoFromText } from "../../../testHelpers";

function getInfoFromTextWithFirstVariableDeclaration(text: string) {
    const obj = getInfoFromText<VariableStatement>(text);
    const firstDeclaration = obj.firstChild.getDeclarations()[0];
    return { ...obj, firstDeclaration };
}

describe(nameof(BindingNamedNode), () => {
    describe(nameof<BindingNamedNode>(n => n.getName), () => {
        function doTest(text: string, expectedName: string) {
            const { sourceFile } = getInfoFromText(text);
            const node = sourceFile.getDescendants().find(Node.isBindingNamedNode)!;
            expect(node.getName()).to.equal(expectedName);
        }

        it("should get the name when an identifier", () => {
            doTest(`function test(p) {}`, "p");
        });

        it("should return the text when when an array binding pattern", () => {
            doTest(`function test([p]) {}`, "[p]");
        });

        it("should return the text when an object binding pattern", () => {
            doTest(`function test({p}) {}`, "{p}");
        });
    });

    describe(nameof<BindingNamedNode>(n => n.getNameNode), () => {
        it("should get the name", () => {
            const { firstDeclaration } = getInfoFromTextWithFirstVariableDeclaration("const { a: b } = { a: 1 }");
            const nameNode = firstDeclaration.getNameNode();
            type typeTest = AssertTrue<IsExact<typeof nameNode, BindingName>>;
            expect(nameNode.getText()).to.equal("{ a: b }");
        });
    });

    describe(nameof<BindingNamedNode>(n => n.rename), () => {
        function throwTest(text: string, renameText: string) {
            const { firstDeclaration } = getInfoFromTextWithFirstVariableDeclaration(text);
            expect(() => firstDeclaration.rename(renameText)).to.throw();
        }

        it("should throw as not implemented when renaming and has an object binding pattern", () => {
            // todo: support this
            // when implemented, this would replace with a "b" identifier and then change
            // the references to the elements to reference the new identifier
            throwTest("const { a: b } = { a: 1 }", "b");
        });

        it("should throw as not implemented when renaming and has an array binding pattern", () => {
            throwTest("const [a, b] = [a, b]", "b");
        });

        function doRenameTest(text: string, renameText: string, expectedText: string) {
            const { firstDeclaration, sourceFile } = getInfoFromTextWithFirstVariableDeclaration(text);
            firstDeclaration.rename(renameText);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should rename when is an identifier", () => {
            doRenameTest("const a = 5;", "b", "const b = 5;");
        });
    });
});
