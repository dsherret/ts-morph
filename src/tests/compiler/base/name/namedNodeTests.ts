import { expect } from "chai";
import { EnumDeclaration, FunctionDeclaration, Identifier, NamedNode, RenameOptions } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(NamedNode), () => {
    describe(nameof<NamedNode>(n => n.rename), () => {
        it("should set the name and rename any referenced nodes", () => {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {}\nlet myEnum: MyEnum;");
            firstChild.rename("MyNewEnum");
            expect(sourceFile.getFullText()).to.equal("enum MyNewEnum {}\nlet myEnum: MyNewEnum;");
        });

        function optionsTest(startText: string, options: RenameOptions, expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>(startText);
            firstChild.rename("MyNewEnum", options);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should rename in strings when specified", () => {
            optionsTest("enum MyEnum {}\nlet myEnum = 'MyEnum';", { renameInStrings: true }, "enum MyNewEnum {}\nlet myEnum = 'MyNewEnum';");
        });

        it("should not rename in strings when specified", () => {
            optionsTest("enum MyEnum {}\nlet myEnum = 'MyEnum';", {}, "enum MyNewEnum {}\nlet myEnum = 'MyEnum';");
        });

        it("should rename in strings when specified", () => {
            optionsTest("// MyEnum\nenum MyEnum {}\n", { renameInComments: true }, "// MyNewEnum\nenum MyNewEnum {}\n");
        });

        it("should not rename in comments when specified", () => {
            optionsTest("// MyEnum\nenum MyEnum {}\n", { }, "// MyEnum\nenum MyNewEnum {}\n");
        });

        it("should rename in both comments and strings when specified", () => {
            optionsTest("// MyEnum\nenum MyEnum {}\nlet myEnum = 'MyEnum';", { renameInComments: true, renameInStrings: true },
                "// MyNewEnum\nenum MyNewEnum {}\nlet myEnum = 'MyNewEnum';");
        });

        function throwTest(text: any) {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(() => firstChild.rename(text)).to.throw();
        }

        it("should throw if null", () => {
            throwTest(null);
        });

        it("should throw if empty string", () => {
            throwTest("");
        });

        it("should throw if whitespace", () => {
            throwTest("    ");
        });

        it("should throw if a number", () => {
            throwTest(4);
        });
    });

    describe(nameof<NamedNode>(n => n.getName), () => {
        const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");

        it("should get the name", () => {
            expect(firstChild.getName()).to.equal("MyEnum");
        });
    });

    describe(nameof<NamedNode>(n => n.getNameNode), () => {
        const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
        const nameNode = firstChild.getNameNode();

        it("should have correct text", () => {
            expect(nameNode.getText()).to.equal("MyEnum");
        });

        it("should be of correct instance", () => {
            expect(nameNode).to.be.instanceOf(Identifier);
        });
    });

    describe(nameof<NamedNode>(n => n.findReferences), () => {
        it("should find all the references", () => {
            // most of the tests for this are in identifierTests
            const {firstChild, sourceFile, project} = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const referencedSymbols = firstChild.findReferences();
            expect(referencedSymbols.length).to.equal(1);
        });
    });

    describe(nameof<NamedNode>(n => n.findReferencesAsNodes), () => {
        it("should find all the references and exclude the definition", () => {
            const {firstChild, sourceFile, project} = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
            const referencingNodes = firstChild.findReferencesAsNodes();
            expect(referencingNodes.length).to.equal(2);
            expect(referencingNodes[0].getParentOrThrow().getText()).to.equal("reference = myFunction");
            expect(referencingNodes[1].getParentOrThrow().getText()).to.equal("reference2 = myFunction");
        });
    });

    describe("fill", () => {
        it("should fill the node with a new name via a rename", () => {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {}\nlet myEnum: MyEnum;");
            firstChild.fill({ name: "MyNewEnum" });
            expect(sourceFile.getFullText()).to.equal("enum MyNewEnum {}\nlet myEnum: MyNewEnum;");
        });
    });
});
