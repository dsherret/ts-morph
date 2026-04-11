import { expect } from "chai";
import { printStructure, StructureKind } from "../../main";

describe("printStructure", () => {
  it("should print a class declaration", () => {
    const result = printStructure({
      kind: StructureKind.Class,
      name: "MyClass",
      isExported: true,
      properties: [{ name: "myProp", type: "string" }],
    });
    expect(result).to.equal("export class MyClass {\n    myProp: string;\n}");
  });

  it("should print an interface declaration", () => {
    const result = printStructure({
      kind: StructureKind.Interface,
      name: "MyInterface",
      properties: [{ name: "value", type: "number" }],
    });
    expect(result).to.equal("interface MyInterface {\n    value: number;\n}");
  });

  it("should print a function declaration", () => {
    const result = printStructure({
      kind: StructureKind.Function,
      name: "myFunc",
      parameters: [{ name: "x", type: "number" }],
      returnType: "string",
    });
    expect(result).to.equal("function myFunc(x: number): string {\n}");
  });

  it("should print an enum declaration", () => {
    const result = printStructure({
      kind: StructureKind.Enum,
      name: "MyEnum",
      members: [{ name: "A", value: 0 }, { name: "B", value: 1 }],
    });
    expect(result).to.equal("enum MyEnum {\n    A = 0,\n    B = 1\n}");
  });

  it("should print a type alias", () => {
    const result = printStructure({
      kind: StructureKind.TypeAlias,
      name: "MyType",
      type: "string | number",
    });
    expect(result).to.equal("type MyType = string | number;");
  });

  it("should print a variable statement", () => {
    const result = printStructure({
      kind: StructureKind.VariableStatement,
      declarationKind: undefined,
      declarations: [{ name: "x", initializer: "5" }],
    });
    expect(result).to.equal("let x = 5;");
  });

  it("should print an import declaration", () => {
    const result = printStructure({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: "./foo",
      namedImports: ["Bar", "Baz"],
    });
    expect(result).to.equal(`import { Bar, Baz } from "./foo";`);
  });

  it("should print an export declaration", () => {
    const result = printStructure({
      kind: StructureKind.ExportDeclaration,
      moduleSpecifier: "./foo",
      namedExports: ["Bar"],
    });
    expect(result).to.equal(`export { Bar } from "./foo";`);
  });

  it("should print a source file structure", () => {
    const result = printStructure({
      kind: StructureKind.SourceFile,
      statements: [
        { kind: StructureKind.ImportDeclaration, moduleSpecifier: "./foo", defaultImport: "Foo" },
        { kind: StructureKind.Class, name: "MyClass" },
      ],
    });
    expect(result).to.equal(`import Foo from "./foo";\n\nclass MyClass {\n}\n`);
  });

  it("should print a decorator", () => {
    const result = printStructure({
      kind: StructureKind.Decorator,
      name: "Injectable",
    });
    expect(result).to.equal("@Injectable");
  });

  it("should respect indentation options", () => {
    const result = printStructure({
      kind: StructureKind.Class,
      name: "MyClass",
      properties: [{ name: "x", type: "number" }],
    }, { indentNumberOfSpaces: 2 });
    expect(result).to.equal("class MyClass {\n  x: number;\n}");
  });

  it("should respect useTabs option", () => {
    const result = printStructure({
      kind: StructureKind.Class,
      name: "MyClass",
      properties: [{ name: "x", type: "number" }],
    }, { useTabs: true });
    expect(result).to.equal("class MyClass {\n\tx: number;\n}");
  });

  it("should throw for function overload structures", () => {
    expect(() =>
      printStructure({
        kind: StructureKind.FunctionOverload,
      })
    ).to.throw(/cannot be printed standalone/i);
  });

  it("should throw for method overload structures", () => {
    expect(() =>
      printStructure({
        kind: StructureKind.MethodOverload,
        isStatic: false,
      })
    ).to.throw(/cannot be printed standalone/i);
  });

  it("should throw for constructor overload structures", () => {
    expect(() =>
      printStructure({
        kind: StructureKind.ConstructorOverload,
      })
    ).to.throw(/cannot be printed standalone/i);
  });
});
