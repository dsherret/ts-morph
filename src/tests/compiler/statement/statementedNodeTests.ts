import {expect} from "chai";
import {StatementedNode, ClassDeclaration, EnumDeclaration, FunctionDeclaration, InterfaceDeclaration, NamespaceDeclaration, TypeAliasDeclaration, VariableStatement,
    VariableDeclarationList, VariableDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.addEnumDeclaration), () => {
        describe("adding to source file", () => {
            const {sourceFile} = getInfoFromText("");
            sourceFile.addEnumDeclaration({
                name: "MyEnum",
                members: [{ name: "member" }]
            });

            it("should have the expected text", () => {
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    member\n}\n");
            });
        });

        describe("adding to non-source file", () => {
            const {sourceFile} = getInfoFromText("namespace MyNamespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaceDeclarations()[0];
            namespaceDec.addEnumDeclaration({
                name: "MyEnum",
                members: [{ name: "member" }]
            });

            it("should have the expected text", () => {
                expect(sourceFile.getFullText()).to.equal("namespace MyNamespace {\n    enum MyEnum {\n        member\n    }\n}\n");
            });
        });
    });

    describe("getting a declaration within a namespace", () => {
        const {sourceFile} = getInfoFromText("namespace Namespace1 {\n    class Class1 {}\n}\n");
        const namespaceDeclaration = sourceFile.getNamespaceDeclarations()[0];
        const classes = namespaceDeclaration.getClassDeclarations();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(1);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getClassDeclarations), () => {
        const {sourceFile} = getInfoFromText("class Class1 {}\nclass Class2 { prop: string; }");
        const classes = sourceFile.getClassDeclarations();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getEnumDeclarations), () => {
        const {sourceFile} = getInfoFromText("enum Enum1 {}\nenum Enum2 { member }");
        const enums = sourceFile.getEnumDeclarations();

        it("should have the expected number of enums", () => {
            expect(enums.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(enums[0]).to.be.instanceOf(EnumDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunctionDeclarations), () => {
        const {sourceFile} = getInfoFromText("function function1() {}\nfunction function2() {}");
        const functions = sourceFile.getFunctionDeclarations();

        it("should have the expected number of functions", () => {
            expect(functions.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(functions[0]).to.be.instanceOf(FunctionDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterfaceDeclarations), () => {
        const {sourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}");
        const interfaces = sourceFile.getInterfaceDeclarations();

        it("should have the expected number of interfaces", () => {
            expect(interfaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(interfaces[0]).to.be.instanceOf(InterfaceDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getNamespaceDeclarations), () => {
        const {sourceFile} = getInfoFromText("namespace Namespace1 {}\nnamespace Namespace2 {}");
        const namespaces = sourceFile.getNamespaceDeclarations();

        it("should have the expected number of namespaces", () => {
            expect(namespaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(namespaces[0]).to.be.instanceOf(NamespaceDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getTypeAliasDeclarations), () => {
        const {sourceFile} = getInfoFromText("type TypeAlias1 = string;\ntype TypeAlias2 = number;");
        const typeAliases = sourceFile.getTypeAliasDeclarations();

        it("should have the expected number of typeAliases", () => {
            expect(typeAliases.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(typeAliases[0]).to.be.instanceOf(TypeAliasDeclaration);
        });
    });

    const {sourceFile: variablesSourceFile} = getInfoFromText("var myVar;\nvar myVar1, myVar2;");
    describe(nameof<StatementedNode>(n => n.getVariableStatements), () => {
        const statements = variablesSourceFile.getVariableStatements();
        it("should have the expected number of statements", () => {
            expect(statements.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(statements[0]).to.be.instanceOf(VariableStatement);
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

    describe(nameof<StatementedNode>(n => n.getVariableDeclarations), () => {
        const declarations = variablesSourceFile.getVariableDeclarations();
        it("should have the expected number of variable declarations", () => {
            expect(declarations.length).to.equal(3);
        });

        it("should have correct type", () => {
            expect(declarations[0]).to.be.instanceOf(VariableDeclaration);
        });
    });

    it("should get items inside a namespace", () => {
        // only need to check for one kind in here
        const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctionDeclarations();
        expect(functions.length).to.equal(2);
    });

    it("should get items inside a function", () => {
        // only need to check for one kind in here
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function Identifier() { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctionDeclarations();
        expect(functions.length).to.equal(2);
    });
});
