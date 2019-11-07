import { expect } from "chai";
import { InterfaceDeclaration, EnumDeclaration, FunctionDeclaration, Identifier, NamedNode, RenameOptions, VariableStatement, ObjectLiteralExpression,
    ShorthandPropertyAssignment } from "../../../../../compiler";
import { getInfoFromText } from "../../../testHelpers";

describe(nameof(NamedNode), () => {
    describe(nameof<NamedNode>(n => n.rename), () => {
        it("should set the name and rename any referenced nodes", () => {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>("enum MyEnum {}\nlet myEnum: MyEnum;");
            firstChild.rename("MyNewEnum");
            expect(sourceFile.getFullText()).to.equal("enum MyNewEnum {}\nlet myEnum: MyNewEnum;");
        });

        function optionsTest(startText: string, options: RenameOptions | undefined, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startText);
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
            optionsTest("// MyEnum\nenum MyEnum {}\n", {}, "// MyEnum\nenum MyNewEnum {}\n");
        });

        it("should rename in both comments and strings when specified", () => {
            optionsTest("// MyEnum\nenum MyEnum {}\nlet myEnum = 'MyEnum';", { renameInComments: true, renameInStrings: true },
                "// MyNewEnum\nenum MyNewEnum {}\nlet myEnum = 'MyNewEnum';");
        });

        it("should rename shorthand property assignments to property assignments when using prefix and suffix text", () => {
            const { firstChild, sourceFile } = getInfoFromText<VariableStatement>("const a = 2; const b = {a};");
            const ole = sourceFile.getVariableDeclarationOrThrow("b").getInitializerOrThrow() as ObjectLiteralExpression;
            const shortHandPropertyAssignment = ole.getPropertyOrThrow("a") as ShorthandPropertyAssignment;
            const identifier = shortHandPropertyAssignment.getNameNode();
            firstChild.getDeclarations()[0].rename("c", { usePrefixAndSuffixText: true });
            expect(sourceFile.getFullText()).to.equal("const c = 2; const b = {a: c};");
            expect(identifier.getText()).to.equal("c");
            expect(shortHandPropertyAssignment.wasForgotten()).to.be.true;
        });

        it("should not rename shorthand property assignments to property assignments when not using prefix and suffix text", () => {
            const { firstChild, sourceFile } = getInfoFromText<VariableStatement>("const a = 2; const b = {a};");
            firstChild.getDeclarations()[0].rename("c", { usePrefixAndSuffixText: false });
            expect(sourceFile.getFullText()).to.equal("const c = 2; const b = {c};");
        });

        it("should rename an identifier exported via an export specifier when using prefix and suffix text", () => {
            const { sourceFile } = getInfoFromText<VariableStatement>("const a = 1; export { a };");
            const exportSpecifier = sourceFile.getExportDeclarations()[0].getNamedExports()[0];
            const exportIdentifier = exportSpecifier.getNameNode();
            sourceFile.getVariableDeclarationOrThrow("a").rename("c", { usePrefixAndSuffixText: true });
            expect(sourceFile.getFullText()).to.equal("const c = 1; export { c as a };");
            expect(exportSpecifier.getText()).to.equal("c as a");
            expect(exportIdentifier.getText()).to.equal("c");
        });

        it("should not rename the export specifier when specifying not to use prefix and suffix text", () => {
            const { sourceFile } = getInfoFromText<VariableStatement>("const a = 1; export { a };");
            sourceFile.getVariableDeclarationOrThrow("a").rename("c", { usePrefixAndSuffixText: false });
            expect(sourceFile.getFullText()).to.equal("const c = 1; export { c };");
        });

        it("should rename an export specifier's identifier when using prefix and suffix text", () => {
            const { sourceFile } = getInfoFromText<VariableStatement>("const a = 1; export { a };");
            const exportSpecifier = sourceFile.getExportDeclarations()[0].getNamedExports()[0];
            const exportIdentifier = exportSpecifier.getNameNode();
            exportIdentifier.rename("c", { usePrefixAndSuffixText: true });
            expect(sourceFile.getFullText()).to.equal("const a = 1; export { a as c };");
            expect(exportSpecifier.getText()).to.equal("a as c");
            expect(exportIdentifier.getText()).to.equal("c");
        });

        it("should rename an import specifier's identifier when using prefix and suffix text", () => {
            const { sourceFile } = getInfoFromText<VariableStatement>("import { a } from './a'; const b = a;");
            const importSpecifier = sourceFile.getImportDeclarations()[0].getNamedImports()[0];
            const importIdentifier = importSpecifier.getNameNode();
            importIdentifier.rename("c", { usePrefixAndSuffixText: true });
            expect(sourceFile.getFullText()).to.equal("import { a as c } from './a'; const b = c;");
            expect(importSpecifier.getText()).to.equal("a as c");
            expect(importIdentifier.getText()).to.equal("c");
        });

        it("should not rename with prefix and suffix by default", () => {
            const { sourceFile, project } = getInfoFromText<VariableStatement>("const a = 1; export { a };");
            sourceFile.move("./a.ts");
            const otherFile = project.createSourceFile("./test.ts", "import { a } from './a';");
            sourceFile.getVariableDeclarationOrThrow("a").rename("c");
            expect(sourceFile.getFullText()).to.equal("const c = 1; export { c };");
            expect(otherFile.getFullText()).to.equal("import { c } from './a';");
        });

        it("should rename with prefix and suffix text when specifying that in the manipulation settings", () => {
            const { sourceFile, project } = getInfoFromText<VariableStatement>("const a = 1; export { a };");
            project.manipulationSettings.set({ usePrefixAndSuffixTextForRename: true });
            sourceFile.getVariableDeclarationOrThrow("a").rename("c");
            expect(sourceFile.getFullText()).to.equal("const c = 1; export { c as a };");
        });

        it("should rename across files", () => {
            const { project, sourceFile, firstChild } = getInfoFromText<EnumDeclaration>("export enum Test {}");
            sourceFile.move("/Test.ts");
            const otherFile = project.createSourceFile("/other.ts", "import { Test } from './Test';");
            firstChild.rename("New");
            expect(sourceFile.getFullText()).to.equal("export enum New {}");
            expect(otherFile.getFullText()).to.equal("import { New } from './Test';");
        });

        function throwTest(text: any) {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
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
        const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");

        it("should get the name", () => {
            expect(firstChild.getName()).to.equal("MyEnum");
        });
    });

    describe(nameof<NamedNode>(n => n.getNameNode), () => {
        const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
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
            const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const referencedSymbols = firstChild.findReferences();
            expect(referencedSymbols.length).to.equal(1);
        });
    });

    describe(nameof<NamedNode>(n => n.findReferencesAsNodes), () => {
        it("should find all the references and exclude the definition", () => {
            const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
            const referencingNodes = firstChild.findReferencesAsNodes();
            expect(referencingNodes.length).to.equal(2);
            expect(referencingNodes[0].getParentOrThrow().getText()).to.equal("reference = myFunction");
            expect(referencingNodes[1].getParentOrThrow().getText()).to.equal("reference2 = myFunction");
        });

        it("should find references in initializers", () => {
            // the reference in the initializer will be classified as `isDefinition` by the compiler
            const code = `interface Test { prop: string; }\nconst partial: Test = { prop: "t" };`;
            const { firstChild, sourceFile, project } = getInfoFromText<InterfaceDeclaration>(code);
            const referencingNodes = firstChild.getProperties()[0].findReferencesAsNodes();
            expect(referencingNodes.length).to.equal(1);
            expect(referencingNodes[0].getParentOrThrow().getText()).to.equal(`prop: "t"`);
        });
    });

    describe(nameof<EnumDeclaration>(n => n.set), () => {
        it("should fill the node with a new name not via a rename", () => {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>("enum MyEnum {}\nlet myEnum: MyEnum;");
            firstChild.set({ name: "MyNewEnum" });
            expect(sourceFile.getFullText()).to.equal("enum MyNewEnum {}\nlet myEnum: MyEnum;");
        });
    });

    describe(nameof<EnumDeclaration>(n => n.getStructure), () => {
        it("should get the name", () => {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(firstChild.getStructure().name).to.equal("MyEnum");
        });
    });
});
