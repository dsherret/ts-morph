import {expect} from "chai";
import {StatementedNode, EnumDeclaration, FunctionDeclaration, InterfaceDeclaration, VariableStatement, VariableDeclarationList,
    VariableDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(StatementedNode), () => {
    const {sourceFile: enumsSourceFile} = getInfoFromText("enum Enum1 {}\nenum  Enum2 { member }");
    const {sourceFile: functionsSourceFile} = getInfoFromText("function function1() {}\nfunction function2() {}");
    const {sourceFile: interfacesSourceFile} = getInfoFromText("interface Interface1 {}\ninterface Interface2 {}");
    const {sourceFile: variablesSourceFile} = getInfoFromText("var myVar;\nvar myVar1, myVar2;");

    describe(nameof<StatementedNode>(n => n.addEnumDeclaration), () => {
        const {sourceFile} = getInfoFromText("");
        sourceFile.addEnumDeclaration({
            name: "MyEnum",
            members: [{ name: "member" }]
        });

        it("should have the expected text", () => {
            expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    member\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getEnumDeclarations), () => {
        const enums = enumsSourceFile.getEnumDeclarations();

        it("should have the expected number of enums", () => {
            expect(enums.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(enums[0]).to.be.instanceOf(EnumDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunctionDeclarations), () => {
        const functions = functionsSourceFile.getFunctionDeclarations();

        it("should have the expected number of functions", () => {
            expect(functions.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(functions[0]).to.be.instanceOf(FunctionDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterfaceDeclarations), () => {
        const interfaces = interfacesSourceFile.getInterfaceDeclarations();

        it("should have the expected number of interfaces", () => {
            expect(interfaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(interfaces[0]).to.be.instanceOf(InterfaceDeclaration);
        });
    });

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
});
