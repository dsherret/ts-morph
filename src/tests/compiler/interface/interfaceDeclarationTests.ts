import { expect } from "chai";
import { ClassDeclaration, InterfaceDeclaration } from "../../../compiler";
import { InterfaceDeclarationSpecificStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(InterfaceDeclaration), () => {
    describe(nameof<InterfaceDeclaration>(d => d.getType), () => {
        it("should get the interface's type", () => {
            const {sourceFile} = getInfoFromText("interface Identifier { prop: string; }");
            expect(sourceFile.getInterfaceOrThrow("Identifier").getType().getText()).to.deep.equal("Identifier");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getBaseTypes), () => {
        function doTest(text: string, interfaceName: string, expectedNames: string[]) {
            const {sourceFile} = getInfoFromText(text);
            const types = sourceFile.getInterfaceOrThrow(interfaceName).getBaseTypes();
            expect(types.map(c => c.getText())).to.deep.equal(expectedNames);
        }

        it("should get the base when it's a interface", () => {
            doTest("interface Base {} interface Child extends Base {}", "Child", ["Base"]);
        });

        it("should get the base when there are multiple", () => {
            doTest("interface Base1 {} interface Base2 {} interface Child extends Base1, Base2 {}", "Child", ["Base1", "Base2"]);
        });

        it("should be empty when there is no base interface", () => {
            doTest("interface Interface {}", "Interface", []);
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getBaseDeclarations), () => {
        function doTest(text: string, interfaceName: string, expectedNames: string[]) {
            const {sourceFile} = getInfoFromText(text);
            const declarations = sourceFile.getInterfaceOrThrow(interfaceName).getBaseDeclarations();
            expect(declarations.map(c => c.getName())).to.deep.equal(expectedNames);
        }

        it("should get the base when it's a interface", () => {
            doTest("interface Base {} interface Child extends Base {}", "Child", ["Base"]);
        });

        it("should get the base when there are multiple", () => {
            doTest("interface Base1 {} interface Base2 {} interface Child extends Base1, Base2 {}", "Child", ["Base1", "Base2"]);
        });

        it("should get the base when there are multiple with the same name", () => {
            doTest("interface Base1 {} interface Base2 { prop: string; } interface Base2 { prop2: string; } interface Child extends Base1, Base2 {}",
                "Child", ["Base1", "Base2", "Base2"]);
        });

        it("should be empty when there is no base interface", () => {
            doTest("interface Interface {}", "Interface", []);
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.fill), () => {
        function doTest(startingCode: string, structure: InterfaceDeclarationSpecificStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("interface Identifier {\n}", {}, "interface Identifier {\n}");
        });

        // currently no members exist on InterfaceDeclarationSpecificStructure
    });

    describe(nameof<InterfaceDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getInterfaces()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the interface declaration", () => {
            doTest("interface I {}\n\ninterface J {}\n\ninterface K {}", 1, "interface I {}\n\ninterface K {}");
        });
    });

    describe(nameof<InterfaceDeclaration>(n => n.getImplementations), () => {
        it("should get the implementations", () => {
            const sourceFileText = "interface MyInterface {}\nexport class Class1 implements MyInterface {}\nclass Class2 implements MyInterface {}";
            const {firstChild, sourceFile, project} = getInfoFromText<InterfaceDeclaration>(sourceFileText);
            const implementations = firstChild.getImplementations();
            expect(implementations.length).to.equal(2);
            expect(implementations[0].getNode().getText()).to.equal("Class1");
            expect(implementations[1].getNode().getText()).to.equal("Class2");
        });
    });
});
