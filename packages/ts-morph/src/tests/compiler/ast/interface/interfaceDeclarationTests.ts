import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { InterfaceDeclaration, TypeParameterVariance } from "../../../../compiler";
import {
  InterfaceDeclarationSpecificStructure,
  InterfaceDeclarationStructure,
  OptionalKind,
  StructureKind,
  TypeParameterDeclarationStructure,
} from "../../../../structures";
import { fillStructures, getInfoFromText, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

describe("InterfaceDeclaration", () => {
  describe(nameof<InterfaceDeclaration>("getType"), () => {
    it("should get the interface's type", () => {
      const { sourceFile } = getInfoFromText("interface Identifier { prop: string; }");
      expect(sourceFile.getInterfaceOrThrow("Identifier").getType().getText()).to.deep.equal("Identifier");
    });
  });

  describe(nameof<InterfaceDeclaration>("getBaseTypes"), () => {
    function doTest(text: string, interfaceName: string, expectedNames: string[]) {
      const { sourceFile } = getInfoFromText(text);
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

  describe(nameof<InterfaceDeclaration>("getBaseDeclarations"), () => {
    function doTest(text: string, interfaceName: string, expectedNames: string[]) {
      const { sourceFile } = getInfoFromText(text);
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
      doTest("interface Base1 {} interface Base2 { prop: string; } interface Base2 { prop2: string; } interface Child extends Base1, Base2 {}", "Child", [
        "Base1",
        "Base2",
        "Base2",
      ]);
    });

    it("should be empty when there is no base interface", () => {
      doTest("interface Interface {}", "Interface", []);
    });
  });

  describe(nameof<InterfaceDeclaration>("set"), () => {
    function doTest(startingCode: string, structure: OptionalKind<InterfaceDeclarationSpecificStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<InterfaceDeclaration>(startingCode);
      firstChild.set(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
    }

    it("should not modify anything if the structure doesn't change anything", () => {
      doTest("interface Identifier {\n}", {}, "interface Identifier {\n}");
    });

    // currently no members exist on InterfaceDeclarationSpecificStructure
  });

  describe(nameof<InterfaceDeclaration>("remove"), () => {
    function doTest(text: string, index: number, expectedText: string) {
      const { sourceFile } = getInfoFromText(text);
      sourceFile.getInterfaces()[index].remove();
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should remove the interface declaration", () => {
      doTest("interface I {}\n\ninterface J {}\n\ninterface K {}", 1, "interface I {}\n\ninterface K {}");
    });
  });

  describe(nameof<InterfaceDeclaration>("getImplementations"), () => {
    it("should get the implementations", () => {
      const sourceFileText = "interface MyInterface {}\nexport class Class1 implements MyInterface {}\nclass Class2 implements MyInterface {}";
      const { firstChild } = getInfoFromText<InterfaceDeclaration>(sourceFileText);
      const implementations = firstChild.getImplementations();
      expect(implementations.length).to.equal(2);
      expect(implementations[0].getNode().getText()).to.equal("Class1");
      expect(implementations[1].getNode().getText()).to.equal("Class2");
    });
  });

  describe(nameof<InterfaceDeclaration>("getStructure"), () => {
    function doTest(code: string, expectedStructure: OptionalTrivia<MakeRequired<InterfaceDeclarationStructure>>) {
      const { firstChild } = getInfoFromText<InterfaceDeclaration>(code);
      const structure = firstChild.getStructure();
      expect(structure).to.deep.equal(fillStructures.interfaceDeclaration(expectedStructure));
    }

    it("should get for an empty interface", () => {
      doTest(`interface Test {}`, {
        kind: StructureKind.Interface,
        callSignatures: [],
        constructSignatures: [],
        docs: [],
        extends: [],
        getAccessors: [],
        hasDeclareKeyword: false,
        indexSignatures: [],
        isDefaultExport: false,
        isExported: false,
        methods: [],
        name: "Test",
        properties: [],
        setAccessors: [],
        typeParameters: [],
      });
    });

    it("should get for an interface that has everything", () => {
      const code = `
/** Test */
export default interface Test<T> extends Test2 {
    (): void;
    new(): Test;
    get foo(): number;
    set foo(value: number);
    [key: string]: string;
    method(): void;
    property: string;
}
`;
      doTest(code, {
        kind: StructureKind.Interface,
        callSignatures: [{ returnType: "void" }],
        constructSignatures: [{ returnType: "Test" }],
        docs: [{ description: "Test" }],
        extends: ["Test2"],
        getAccessors: [{
          decorators: [],
          docs: [],
          isAbstract: false,
          isStatic: false,
          kind: StructureKind.GetAccessor,
          name: "foo",
          parameters: [],
          returnType: "number",
          scope: undefined,
          statements: undefined,
          typeParameters: [],
        }],
        hasDeclareKeyword: false,
        indexSignatures: [{ keyName: "key", returnType: "string" }],
        isDefaultExport: true,
        isExported: true,
        methods: [{ name: "method", returnType: "void" }],
        name: "Test",
        properties: [{ name: "property", type: "string" }],
        typeParameters: [{ name: "T", variance: TypeParameterVariance.None }],
        setAccessors: [{
          decorators: [],
          docs: [],
          isAbstract: false,
          isStatic: false,
          kind: StructureKind.SetAccessor,
          name: "foo",
          parameters: [{
            decorators: [],
            hasOverrideKeyword: false,
            hasQuestionToken: false,
            initializer: undefined,
            isReadonly: false,
            isRestParameter: false,
            kind: StructureKind.Parameter,
            name: "value",
            scope: undefined,
            type: "number",
          }],
          typeParameters: [],
        }],
      });
    });
  });
});
