import { expect } from "chai";
import { ClassDeclaration, FunctionExpression, NameableNode, VariableStatement } from "../../../../../compiler";
import { NameableNodeStructure } from "../../../../../structures";
import { getInfoFromText } from "../../../testHelpers";

describe(nameof(NameableNode), () => {
    function getFunctionExpression(startCode: string) {
        const result = getInfoFromText<VariableStatement>(startCode);
        const funcExpr = result.firstChild.getDeclarations()[0].getInitializerOrThrow() as FunctionExpression;
        return { funcExpr, ...result };
    }

    describe(nameof<NameableNode>(n => n.rename), () => {
        function doTest(startCode: string, newName: string, expectedCode: string) {
            const { funcExpr, sourceFile } = getFunctionExpression(startCode);
            funcExpr.rename(newName);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set the name if it doesn't exist", () => {
            doTest("const v = function() { return 2; };", "newName", "const v = function newName() { return 2; };");
        });

        it("should remove the name when providing an empty string", () => {
            doTest("const v = function name() { return 2; };", "", "const v = function() { return 2; };");
        });

        it("should do nothing when no name and an empty string", () => {
            doTest("const v = function() { return 2; };", "", "const v = function() { return 2; };");
        });

        it("should rename the name", () => {
            doTest("const v = function oldName() { return 2; };", "newName", "const v = function newName() { return 2; };");
        });
    });

    describe(nameof<NameableNode>(n => n.removeName), () => {
        function doTest(startCode: string, expectedCode: string) {
            const { funcExpr, sourceFile } = getFunctionExpression(startCode);
            funcExpr.removeName();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove the name when exists", () => {
            doTest("const v = function name() { return 2; };", "const v = function() { return 2; };");
        });

        it("should do nothing the name does not exist", () => {
            doTest("const v = function() { return 2; };", "const v = function() { return 2; };");
        });
    });

    describe(nameof<NameableNode>(n => n.getName), () => {
        function doTest(startCode: string, expectedName: string | undefined) {
            const { funcExpr, sourceFile } = getFunctionExpression(startCode);
            expect(funcExpr.getName()).to.equal(expectedName);
        }

        it("should get the name when it exists", () => {
            doTest("const v = function name() {};", "name");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("const v = function() {};", undefined);
        });
    });

    describe(nameof<NameableNode>(n => n.getNameOrThrow), () => {
        it("should get the name when it exists", () => {
            const { funcExpr, sourceFile } = getFunctionExpression("const v = function name() {};");
            expect(funcExpr.getNameOrThrow()).to.equal("name");
        });

        it("should throw when it doesn't exist", () => {
            const { funcExpr, sourceFile } = getFunctionExpression("const v = function() {};");
            expect(() => funcExpr.getNameOrThrow()).to.throw();
        });
    });

    describe(nameof<NameableNode>(n => n.getNameNode), () => {
        function doTest(startCode: string, expectedName: string | undefined) {
            const { funcExpr, sourceFile } = getFunctionExpression(startCode);
            const identifier = funcExpr.getNameNode();
            expect(identifier?.getText()).to.equal(expectedName);
        }

        it("should get the name when it exists", () => {
            doTest("const v = function name() {};", "name");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("const v = function() {};", undefined);
        });
    });

    describe(nameof<NameableNode>(n => n.getNameNodeOrThrow), () => {
        it("should get the name when it exists", () => {
            const { funcExpr } = getFunctionExpression("const v = function name() {};");
            expect(funcExpr.getNameNodeOrThrow().getText()).to.equal("name");
        });

        it("should throw when it doesn't exist", () => {
            const { funcExpr } = getFunctionExpression("const v = function() {};");
            expect(() => funcExpr.getNameNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<NameableNode>(n => n.findReferences), () => {
        it("should find the references when there is a name", () => {
            // most of the tests for this are in identifierTests
            const { firstChild, project } = getInfoFromText<ClassDeclaration>("class MyClass {}");
            const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = MyClass;");
            const referencedSymbols = firstChild.findReferences();
            expect(referencedSymbols.length).to.equal(1);
        });

        it("should find the references when there isn't a name", () => {
            const { firstChild, project } = getInfoFromText<ClassDeclaration>("export default class {}");
            const secondSourceFile = project.createSourceFile("/second.ts", "import MyClass from './MyClass';\nconst reference2 = MyClass;");
            const referencedSymbols = firstChild.findReferences();
            expect(referencedSymbols.length).to.equal(1);
        });
    });

    describe(nameof<NameableNode>(n => n.findReferencesAsNodes), () => {
        it("should find all the references and exclude the definition when there is a name", () => {
            const { firstChild, project } = getInfoFromText<ClassDeclaration>("class MyClass {}\nconst reference = MyClass;");
            const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = MyClass;");
            const referencingNodes = firstChild.findReferencesAsNodes();
            expect(referencingNodes.length).to.equal(2);
            expect(referencingNodes[0].getParentOrThrow().getText()).to.equal("reference = MyClass");
            expect(referencingNodes[1].getParentOrThrow().getText()).to.equal("reference2 = MyClass");
        });

        it("should find all the references and exclude the definition when there isn't a name", () => {
            const { firstChild, project } = getInfoFromText<ClassDeclaration>("export default class {}", { filePath: "/MyClass.ts" });
            const secondSourceFile = project.createSourceFile("/second.ts", "import MyClass from './MyClass';\nconst reference2 = MyClass;");
            const referencingNodes = firstChild.findReferencesAsNodes();
            expect(referencingNodes.length).to.equal(2);
            expect(referencingNodes[0].getParentOrThrow().getParentOrThrow().getText()).to.equal("import MyClass from './MyClass';");
            expect(referencingNodes[1].getParentOrThrow().getText()).to.equal("reference2 = MyClass");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.set), () => {
        function doTest(text: string, structure: NameableNodeStructure, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
            firstChild.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove name when specifiying undefined", () => {
            doTest("export default class Test {}", { name: undefined }, "export default class {}");
        });

        it("should do nothing when property not exists", () => {
            doTest("export default class Test {}", {}, "export default class Test {}");
        });

        it("should not rename when specifying name", () => {
            doTest("class Test {} const t: Test;", { name: "NewName" }, "class NewName {} const t: Test;");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.getStructure), () => {
        function doTest(text: string, name: string | undefined) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
            expect(firstChild.getStructure().name).to.equal(name);
        }

        it("should be undefined when no name", () => {
            doTest("export default class {}", undefined);
        });

        it("should get name when exists", () => {
            doTest("export default class Test {}", "Test");
        });
    });
});
