import {expect} from "chai";
import {StatementedNode, ClassDeclaration, EnumDeclaration, FunctionDeclaration, InterfaceDeclaration, NamespaceDeclaration, TypeAliasDeclaration, VariableStatement,
    VariableDeclarationList, VariableDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.addEnum), () => {
        describe("adding to source file", () => {
            const {sourceFile} = getInfoFromText("");
            sourceFile.addEnum({
                name: "MyEnum",
                members: [{ name: "member" }],
                isConst: true
            });

            it("should have the expected text", () => {
                expect(sourceFile.getFullText()).to.equal("const enum MyEnum {\n    member\n}\n");
            });
        });

        describe("adding to non-source file", () => {
            const {sourceFile} = getInfoFromText("namespace MyNamespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.addEnum({
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
        const namespaceDeclaration = sourceFile.getNamespaces()[0];
        const classes = namespaceDeclaration.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(1);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getClasses), () => {
        const {sourceFile} = getInfoFromText("class Class1 {}\nclass Class2 { prop: string; }");
        const classes = sourceFile.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getClass), () => {
        const {sourceFile} = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");

        it("should get a class by a name", () => {
            expect(sourceFile.getClass("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a class by a search function", () => {
            expect(sourceFile.getClass(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the class doesn't exist", () => {
            expect(sourceFile.getClass("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getEnums), () => {
        const {sourceFile} = getInfoFromText("enum Identifier1 {}\nenum Identifier2 { member }");
        const enums = sourceFile.getEnums();

        it("should have the expected number of enums", () => {
            expect(enums.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(enums[0]).to.be.instanceOf(EnumDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getEnum), () => {
        const {sourceFile} = getInfoFromText("enum Identifier1 {}\nenum Identifier2 { member }");

        it("should get an enum by a name", () => {
            expect(sourceFile.getEnum("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a enum by a search function", () => {
            expect(sourceFile.getEnum(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the enum doesn't exist", () => {
            expect(sourceFile.getEnum("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunctions), () => {
        const {sourceFile} = getInfoFromText("function Identifier1() {}\nfunction Identifier2() {}");
        const functions = sourceFile.getFunctions();

        it("should have the expected number of functions", () => {
            expect(functions.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(functions[0]).to.be.instanceOf(FunctionDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunction), () => {
        const {sourceFile} = getInfoFromText("function Identifier1() {}\nfunction Identifier2() {}");

        it("should get a function by a name", () => {
            expect(sourceFile.getFunction("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a function by a search function", () => {
            expect(sourceFile.getFunction(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the function doesn't exist", () => {
            expect(sourceFile.getFunction("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterfaces), () => {
        const {sourceFile} = getInfoFromText("interface Identifier1 {}\ninterface Identifier2 {}");
        const interfaces = sourceFile.getInterfaces();

        it("should have the expected number of interfaces", () => {
            expect(interfaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(interfaces[0]).to.be.instanceOf(InterfaceDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterface), () => {
        const {sourceFile} = getInfoFromText("interface Identifier1 {}\ninterface Identifier2 {}");

        it("should get an interface by a name", () => {
            expect(sourceFile.getInterface("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a interface by a search function", () => {
            expect(sourceFile.getInterface(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the interface doesn't exist", () => {
            expect(sourceFile.getInterface("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getNamespaces), () => {
        const {sourceFile} = getInfoFromText("namespace Identifier1 {}\nnamespace Identifier2 {}");
        const namespaces = sourceFile.getNamespaces();

        it("should have the expected number of namespaces", () => {
            expect(namespaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(namespaces[0]).to.be.instanceOf(NamespaceDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getNamespace), () => {
        const {sourceFile} = getInfoFromText("namespace Identifier1 {}\nnamespace Identifier2 {}");

        it("should get a namespace by a name", () => {
            expect(sourceFile.getNamespace("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a namespace by a search function", () => {
            expect(sourceFile.getNamespace(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the namespace doesn't exist", () => {
            expect(sourceFile.getNamespace("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getTypeAliases), () => {
        const {sourceFile} = getInfoFromText("type Identifier1 = string;\ntype Identifier2 = number;");
        const typeAliases = sourceFile.getTypeAliases();

        it("should have the expected number of typeAliases", () => {
            expect(typeAliases.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(typeAliases[0]).to.be.instanceOf(TypeAliasDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getTypeAlias), () => {
        const {sourceFile} = getInfoFromText("type Identifier1 = string;\ntype Identifier2 = number;");

        it("should get a type alias by a name", () => {
            expect(sourceFile.getTypeAlias("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a type alias by a search function", () => {
            expect(sourceFile.getTypeAlias(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the type alias doesn't exist", () => {
            expect(sourceFile.getTypeAlias("asdf")).to.be.undefined;
        });
    });

    const {sourceFile: variablesSourceFile} = getInfoFromText("var Identifier1;\nvar Identifier2, Identifier3;");
    describe(nameof<StatementedNode>(n => n.getVariableStatements), () => {
        const statements = variablesSourceFile.getVariableStatements();
        it("should have the expected number of statements", () => {
            expect(statements.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(statements[0]).to.be.instanceOf(VariableStatement);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableStatement), () => {
        it("should get a variable statement when something matches", () => {
            const statement = variablesSourceFile.getVariableStatement(s => s.getDeclarationList().getDeclarations().length === 2)!;
            expect(statement.getDeclarationList().getDeclarations()[0].getName()).to.equal("Identifier2");
        });

        it("should return undefined when nothing matches", () => {
            const statement = variablesSourceFile.getVariableStatement(s => s.getDeclarationList().getDeclarations().length === 5);
            expect(statement).to.be.undefined;
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

    describe(nameof<StatementedNode>(n => n.getVariableDeclarationList), () => {
        it("should get a variable declaration list when something matches", () => {
            const list = variablesSourceFile.getVariableDeclarationList(s => s.getDeclarations().length === 2)!;
            expect(list.getDeclarations()[0].getName()).to.equal("Identifier2");
        });

        it("should return undefined when nothing matches", () => {
            const list = variablesSourceFile.getVariableDeclarationList(s => s.getDeclarations().length === 5);
            expect(list).to.be.undefined;
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

    describe(nameof<StatementedNode>(n => n.getVariableDeclaration), () => {
        it("should get a variable declaration by a name", () => {
            expect(variablesSourceFile.getVariableDeclaration("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a variable declaration by a search function", () => {
            expect(variablesSourceFile.getVariableDeclaration(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the variable declaration doesn't exist", () => {
            expect(variablesSourceFile.getVariableDeclaration("asdf")).to.be.undefined;
        });
    });

    it("should get items inside a namespace", () => {
        // only need to check for one kind in here
        const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctions();
        expect(functions.length).to.equal(2);
    });

    it("should get items inside a function", () => {
        // only need to check for one kind in here
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function Identifier() { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctions();
        expect(functions.length).to.equal(2);
    });
});
