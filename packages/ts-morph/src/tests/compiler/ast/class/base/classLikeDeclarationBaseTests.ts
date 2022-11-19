import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import {
  ClassDeclaration,
  ClassLikeDeclarationBase,
  ClassStaticBlockDeclaration,
  CommentClassElement,
  ConstructorDeclaration,
  ExpressionWithTypeArguments,
  GetAccessorDeclaration,
  MethodDeclaration,
  Node,
  ParameterDeclaration,
  PropertyDeclaration,
  Scope,
  SetAccessorDeclaration,
} from "../../../../../compiler";
import {
  ClassMemberStructures,
  ClassStaticBlockDeclarationStructure,
  ConstructorDeclarationStructure,
  GetAccessorDeclarationStructure,
  MethodDeclarationStructure,
  PropertyDeclarationStructure,
  SetAccessorDeclarationStructure,
  StructureKind,
} from "../../../../../structures";
import { WriterFunction } from "../../../../../types";
import { getInfoFromText, getInfoFromTextWithDescendant, OptionalKindAndTrivia } from "../../../testHelpers";

describe("ClassLikeDeclarationBase", () => {
  function getInfoFromTextForClassLike(text: string) {
    const info = getInfoFromText(text);
    return {
      ...info,
      classNode: info.sourceFile.getFirstDescendantOrThrow(
        d => Node.isClassExpression(d) || Node.isClassDeclaration(d),
      ) as Node & ClassLikeDeclarationBase,
    };
  }

  describe(nameof<ClassLikeDeclarationBase>("getExtends"), () => {
    function doTest(text: string, expected: boolean) {
      const { classNode } = getInfoFromTextForClassLike(text);
      const extendsNode = classNode.getExtends();
      if (expected)
        expect(extendsNode).to.be.instanceOf(ExpressionWithTypeArguments);
      else
        expect(extendsNode).to.be.undefined;
    }

    it("should return undefined when no extends clause exists", () => {
      doTest("class Identifier {}", false);
    });

    it("should return a heritage clause when an extends clause exists", () => {
      doTest("class Identifier extends Base {}", true);
    });

    it("should return a heritage clause for a class expression", () => {
      doTest("const c = class extends Base {}", true);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getExtendsOrThrow"), () => {
    it("should throw when no extends clause exists", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier { }");
      expect(() => firstChild.getExtendsOrThrow()).to.throw();
    });

    it("should return a heritage clause when an extends clause exists", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier extends Base { }");
      expect(firstChild.getExtendsOrThrow()).to.be.instanceOf(ExpressionWithTypeArguments);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("setExtends"), () => {
    function doTest(startCode: string, extendsText: string | WriterFunction, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
      firstChild.setExtends(extendsText);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
    }

    it("should set an extends", () => {
      doTest("  class Identifier {}  ", "Base", "  class Identifier extends Base {}  ");
    });

    it("should set an extends with a writer function and queued indentation", () => {
      doTest("class Identifier {}", writer => writer.writeLine("Test<").write("number>"), "class Identifier extends Test<\n    number> {}");
    });

    it("should set an extends when an implements exists", () => {
      doTest("class Identifier implements IBase {}", "Base", "class Identifier extends Base implements IBase {}");
    });

    it("should set an extends when the brace is right beside the identifier", () => {
      doTest("  class Identifier{}  ", "Base", "  class Identifier extends Base {}  ");
    });

    it("should set an extends when an extends already exists", () => {
      doTest("class Identifier extends Base1 {}", "Base2", "class Identifier extends Base2 {}");
    });

    it("should remove when providing an empty string", () => {
      doTest("class Identifier extends Base1 {}", "", "class Identifier {}");
    });

    it("should remove when providing whitespace string", () => {
      doTest("class Identifier extends Base1 {}", "    ", "class Identifier {}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("removeExtends"), () => {
    function doTest(startCode: string, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
      firstChild.removeExtends();
      expect(sourceFile.getFullText()).to.equal(expectedCode);
    }

    it("should not do anything when there's no thing to remove", () => {
      doTest("class Identifier {}", "class Identifier {}");
    });

    it("should remove when there is an extends", () => {
      doTest("class Identifier extends Base1 {}", "class Identifier {}");
    });

    it("should remove when there is an extends and implements", () => {
      doTest("class Identifier extends Base1 implements T {}", "class Identifier implements T {}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addMember"), () => {
    function doTest(startCode: string, member: string | WriterFunction | ClassMemberStructures, expectedCode: string) {
      const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addMember(member);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(Node);
    }

    it("should add a member", () => {
      const expectedText = "class c {\n    // test\n    p1;\n    p2;\n    p3;\n}";
      doTest("class c {\n    // test\n    p1;\n    p2;\n}", {
        kind: StructureKind.Property,
        name: "p3",
      }, expectedText);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addMembers"), () => {
    type MembersType = string | WriterFunction | (string | WriterFunction | ClassMemberStructures)[];
    function doTest(startCode: string, members: MembersType, expectedCode: string, expectedResultCount: number) {
      const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addMembers(members);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result.length).to.equal(expectedResultCount);
    }

    it("should add members", () => {
      const expectedText = "class c {\n    // test\n    p1;\n    p2;\n    p3;\n\n    m4() {\n    }\n}";
      doTest(
        "class c {\n    // test\n    p1;\n    p2;\n}",
        [{
          kind: StructureKind.Property,
          name: "p3",
        }, {
          kind: StructureKind.Method,
          name: "m4",
        }],
        expectedText,
        2,
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertMember"), () => {
    function doTest(startCode: string, insertIndex: number, member: string | WriterFunction | ClassMemberStructures, expectedCode: string) {
      const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertMember(insertIndex, member);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(Node);
    }

    it("should insert at the specified index", () => {
      const expectedText = "class c {\n    p1;\n    p2;\n    p3;\n}";
      doTest("class c {\n    p1;\n    p3;\n}", 1, {
        kind: StructureKind.Property,
        name: "p2",
      }, expectedText);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertMembers"), () => {
    type MembersType = string | WriterFunction | (string | WriterFunction | ClassMemberStructures)[];
    function doTest(startCode: string, insertIndex: number, members: MembersType, expectedCode: string, expectedResultCount: number) {
      const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertMembers(insertIndex, members);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result.length).to.equal(expectedResultCount);
    }

    it("should accept providing a string", () => {
      doTest("class c {\n}", 0, "// test", "class c {\n    // test\n}", 1);
    });

    it("should accept providing a writer function", () => {
      doTest("class c {\n}", 0, writer => writer.write("// test"), "class c {\n    // test\n}", 1);
    });

    it("should insert all the different kinds of members", () => {
      const expectedText = `class c {\n    constructor() {\n    }\n\n    p1;\n    p2;\n\n`
        + `    m1() {\n    }\n\n    get g1() {\n    }\n\n    set s1() {\n    }\n\n    // testing\n}`;
      doTest(
        "class c {\n}",
        0,
        [{
          kind: StructureKind.Constructor,
        }, {
          kind: StructureKind.Property,
          name: "p1",
        }, {
          kind: StructureKind.Property,
          name: "p2",
        }, {
          kind: StructureKind.Method,
          name: "m1",
        }, {
          kind: StructureKind.GetAccessor,
          name: "g1",
        }, {
          kind: StructureKind.SetAccessor,
          name: "s1",
        }, "// testing"],
        expectedText,
        7,
      );
    });

    it("should insert between properties with correct spacing when inserting a property", () => {
      const expectedText = "class c {\n    p1;\n    p2;\n    p3;\n}";
      doTest(
        "class c {\n    p1;\n    p3;\n}",
        1,
        [{
          kind: StructureKind.Property,
          name: "p2",
        }],
        expectedText,
        1,
      );
    });

    it("should insert between properties with correct spacing when inserting a method", () => {
      const expectedText = "class c {\n    p1;\n\n    m2() {\n    }\n\n    p3;\n}";
      doTest(
        "class c {\n    p1;\n    p3;\n}",
        1,
        [{
          kind: StructureKind.Method,
          name: "m2",
        }],
        expectedText,
        1,
      );
    });

    it("should insert between methods with correct spacing when inserting a property", () => {
      const expectedText = "class c {\n    m1() {\n    }\n\n    p2;\n\n    m3() {\n    }\n}";
      doTest(
        "class c {\n    m1() {\n    }\n\n    m3() {\n    }\n}",
        1,
        [{
          kind: StructureKind.Property,
          name: "p2",
        }],
        expectedText,
        1,
      );
    });

    it("should insert between methods with correct spacing when inserting a method", () => {
      const expectedText = "class c {\n    m1() {\n    }\n\n    m2() {\n    }\n\n    m3() {\n    }\n}";
      doTest(
        "class c {\n    m1() {\n    }\n\n    m3() {\n    }\n}",
        1,
        [{
          kind: StructureKind.Method,
          name: "m2",
        }],
        expectedText,
        1,
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertConstructor"), () => {
    function doTest(startCode: string, insertIndex: number, structure: OptionalKindAndTrivia<ConstructorDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertConstructor(insertIndex, structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(ConstructorDeclaration);
    }

    it("should insert when none exists", () => {
      doTest("class c {\n}", 0, {}, "class c {\n    constructor() {\n    }\n}");
    });

    it("should not remove the previous constructor when one exists", () => {
      doTest(
        "class c {\n    constructor() {\n    }\n}",
        1,
        { scope: Scope.Private },
        "class c {\n    constructor() {\n    }\n\n    private constructor() {\n    }\n}",
      );
    });

    it("should insert multiple into other members", () => {
      doTest("class c {\n//1\n    prop1;\n    prop2;\n}", 2, {}, "class c {\n//1\n    prop1;\n\n    constructor() {\n    }\n\n    prop2;\n}");
    });

    it("should insert all the properties of the structure", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<ConstructorDeclarationStructure>> = {
        docs: [{ description: "Test" }],
        overloads: [{}, { scope: Scope.Private }],
        scope: Scope.Public,
        parameters: [{ name: "param" }],
        returnType: "number", // won't be written out
        typeParameters: [{ name: "T" }],
        statements: [{
          kind: StructureKind.TypeAlias,
          name: "T",
          type: "string",
        }, {
          kind: StructureKind.Interface,
          name: "I",
        }, {
          kind: StructureKind.Enum,
          name: "E",
        }, {
          kind: StructureKind.Function,
          name: "F",
        }, {
          kind: StructureKind.Class,
          name: "C",
        }, {
          kind: StructureKind.Module,
          name: "N",
        }, "console.log('here');"],
      };
      doTest(
        "class c {\n}",
        0,
        structure,
        "class c {\n    public constructor();\n    private constructor();\n    /** Test */\n    public constructor<T>(param) {\n"
          + "        type T = string;\n\n        interface I {\n        }\n\n        enum E {\n        }\n\n"
          + "        function F() {\n        }\n\n        class C {\n        }\n\n        namespace N {\n        }\n\n"
          + "        console.log('here');\n"
          + "    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addConstructor"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<ConstructorDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addConstructor(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(ConstructorDeclaration);
    }

    it("should add at the end", () => {
      doTest("class c {\n    prop1;\n}", {}, "class c {\n    prop1;\n\n    constructor() {\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addConstructors"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<ConstructorDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addConstructors(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structure.length);
    }

    it("should add at the end", () => {
      doTest("class c {\n    prop1;\n}", [{}, {}], "class c {\n    prop1;\n\n    constructor() {\n    }\n\n    constructor() {\n    }\n}");
    });

    it("should print multiple correctly when ambient", () => {
      doTest("declare class c {\n}", [{}, { parameters: [{ name: "p", type: "any" }] }], "declare class c {\n    constructor();\n    constructor(p: any);\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertConstructors"), () => {
    function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<ConstructorDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertConstructors(index, structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structure.length);
    }

    it("should insert multiple constructors", () => {
      doTest("class c {\n    prop1;\n}", 0, [{}, {}], "class c {\n    constructor() {\n    }\n\n    constructor() {\n    }\n\n    prop1;\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getConstructors"), () => {
    it("should return undefined when no constructor exists", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier { }");
      expect(firstChild.getConstructors().length).to.equal(0);
    });

    it("should return the constructor when it exists", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier { constructor() { } }");
      expect(firstChild.getConstructors()[0]!.getText()).to.equal("constructor() { }");
    });

    it("should return the implementation constructor if not in an ambient context", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier { constructor(str: string);constructor(str: any) { } }");
      const constructors = firstChild.getConstructors();
      expect(constructors.length).to.equal(1);
      expect(constructors[0]!.getText()).to.equal("constructor(str: any) { }");
    });

    it("should return both constructors in an ambient context", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("declare class Identifier { constructor(str: string);constructor(str: any);}");
      const constructors = firstChild.getConstructors();
      expect(constructors.length).to.equal(2);
      expect(constructors[0]!.getText()).to.equal("constructor(str: string);");
      expect(constructors[1]!.getText()).to.equal("constructor(str: any);");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertStaticBlock"), () => {
    function doTest(startCode: string, insertIndex: number, structure: OptionalKindAndTrivia<ClassStaticBlockDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertStaticBlock(insertIndex, structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(ClassStaticBlockDeclaration);
    }

    it("should insert when none exists", () => {
      doTest("class c {\n}", 0, {}, "class c {\n    static {\n    }\n}");
    });

    it("should not remove the previous static block when one exists", () => {
      doTest("class c {\n    static {\n    }\n}", 1, {}, "class c {\n    static {\n    }\n\n    static {\n    }\n}");
    });

    it("should insert into other members", () => {
      doTest("class c {\n//1\n    prop1;\n    prop2;\n}", 2, {}, "class c {\n//1\n    prop1;\n\n    static {\n    }\n\n    prop2;\n}");
    });

    it("should insert all the properties of the structure", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<ClassStaticBlockDeclarationStructure>> = {
        docs: [{ description: "Test" }],
        statements: ["console;"],
      };
      doTest("class c {\n}", 0, structure, "class c {\n    static {\n        console;\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addStaticBlock"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<ClassStaticBlockDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addStaticBlock(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(ClassStaticBlockDeclaration);
    }

    it("should add at the end", () => {
      doTest("class c {\n    prop1;\n}", {}, "class c {\n    prop1;\n\n    static {\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addStaticBlocks"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<ClassStaticBlockDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addStaticBlocks(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structure.length);
    }

    it("should add at the end", () => {
      doTest("class c {\n    prop1;\n}", [{}, {}], "class c {\n    prop1;\n\n    static {\n    }\n\n    static {\n    }\n}");
    });

    it("should print multiple correctly when ambient (does this anyway)", () => {
      doTest("declare class c {\n}", [{}, { statements: "test;" }], "declare class c {\n    static {\n    }\n\n    static {\n        test;\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertStaticBlocks"), () => {
    function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<ClassStaticBlockDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertStaticBlocks(index, structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should insert multiple static blocks", () => {
      doTest("class c {\n    prop1;\n}", 0, [{}, {}], "class c {\n    static {\n    }\n\n    static {\n    }\n\n    prop1;\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticBlocks"), () => {
    it("should return nothing when none exists", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier { }");
      expect(firstChild.getStaticBlocks().length).to.equal(0);
    });

    it("should return the static block when it exists", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier { static { } static { console; } }");
      expect(firstChild.getStaticBlocks()[0]!.getText()).to.equal("static { }");
      expect(firstChild.getStaticBlocks()[1]!.getText()).to.equal("static { console; }");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertGetAccessors"), () => {
    function doTest(startCode: string, insertIndex: number, structures: OptionalKindAndTrivia<GetAccessorDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertGetAccessors(insertIndex, structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should insert when none exists", () => {
      doTest("class c {\n}", 0, [{ name: "identifier" }], "class c {\n    get identifier() {\n    }\n}");
    });

    it("should insert multiple into other methods", () => {
      doTest(
        "class c {\n//1\n    m1() {\n    }\n\n    m4() {\n    }\n}",
        2,
        [{ isStatic: true, name: "m2", returnType: "string" }, { name: "m3" }],
        "class c {\n//1\n    m1() {\n    }\n\n    static get m2(): string {\n    }\n\n    get m3() {\n    }\n\n    m4() {\n    }\n}",
      );
    });

    it("should insert into ambient class", () => {
      doTest("declare class c {\n}", 0, [{ name: "g1", returnType: "string" }], "declare class c {\n    get g1(): string;\n}");
    });

    it("should insert all the properties of the structure", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<GetAccessorDeclarationStructure>> = {
        decorators: [{ name: "dec" }],
        isAbstract: false,
        isStatic: true,
        name: "prop",
        docs: [{ description: "Test" }],
        scope: Scope.Public,
        parameters: [{ name: "param" }],
        returnType: "number",
        typeParameters: [{ name: "T" }],
        statements: [{ kind: StructureKind.Class, name: "C" }, "console.log('here');"],
      };
      doTest(
        "class c {\n}",
        0,
        [structure],
        "class c {\n    /** Test */\n    @dec\n    public static get prop<T>(param): number {\n"
          + "        class C {\n        }\n\n        console.log('here');\n"
          + "    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertGetAccessor"), () => {
    function doTest(startCode: string, insertIndex: number, structure: OptionalKindAndTrivia<GetAccessorDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertGetAccessor(insertIndex, structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(GetAccessorDeclaration);
    }

    it("should insert", () => {
      doTest(
        "class c {\n    m1() {\n    }\n\n    m3() {\n    }\n}",
        1,
        { name: "m2" },
        "class c {\n    m1() {\n    }\n\n    get m2() {\n    }\n\n    m3() {\n    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addGetAccessors"), () => {
    function doTest(startCode: string, structures: OptionalKindAndTrivia<GetAccessorDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addGetAccessors(structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should add multiple", () => {
      doTest(
        "class c {\n    m1() {\n    }\n}",
        [{ name: "m2" }, { name: "m3" }],
        "class c {\n    m1() {\n    }\n\n    get m2() {\n    }\n\n    get m3() {\n    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addGetAccessor"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<GetAccessorDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addGetAccessor(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(GetAccessorDeclaration);
    }

    it("should insert", () => {
      doTest("class c {\n    m1() {\n    }\n}", { name: "m2" }, "class c {\n    m1() {\n    }\n\n    get m2() {\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertProperties"), () => {
    function doTest(startCode: string, insertIndex: number, structures: OptionalKindAndTrivia<PropertyDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertProperties(insertIndex, structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should insert when none exists", () => {
      doTest("class c {\n}", 0, [{ name: "prop" }], "class c {\n    prop;\n}");
    });

    it("should insert multiple into other properties", () => {
      doTest(
        "class c {\n//1\n    prop1;\n    prop4;\n}",
        2,
        [{ name: "prop2", hasQuestionToken: true, type: "string" }, { name: "prop3" }],
        "class c {\n//1\n    prop1;\n    prop2?: string;\n    prop3;\n    prop4;\n}",
      );
    });

    it("should add an extra newline if inserting before non-property", () => {
      doTest("class c {\n    myMethod() {}\n}", 0, [{ name: "prop" }], "class c {\n    prop;\n\n    myMethod() {}\n}");
    });

    it("should add an extra newline if inserting ater non-property", () => {
      doTest("class c {\n    myMethod() {}\n}", 1, [{ name: "prop" }], "class c {\n    myMethod() {}\n\n    prop;\n}");
    });

    it("should insert all the properties of the structure", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<PropertyDeclarationStructure>> = {
        decorators: [{ name: "dec" }],
        isStatic: true,
        name: "prop",
        docs: [{ description: "Test" }],
        scope: Scope.Public,
        type: "number",
        hasExclamationToken: true, // will favour question token
        hasAccessorKeyword: true,
        hasQuestionToken: true,
        hasDeclareKeyword: true,
        hasOverrideKeyword: true,
        initializer: "5",
        isAbstract: false,
        isReadonly: true,
      };
      doTest(
        "class c {\n}",
        0,
        [structure, { name: "other", hasExclamationToken: true }],
        "class c {\n    /** Test */\n    @dec\n    declare public static override readonly accessor prop?: number = 5;\n    other!;\n"
          + "}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertProperty"), () => {
    function doTest(startCode: string, insertIndex: number, structure: OptionalKindAndTrivia<PropertyDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertProperty(insertIndex, structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(PropertyDeclaration);
    }

    it("should insert at index", () => {
      doTest("class c {\n    prop1;\n    prop3;\n}", 1, { name: "prop2" }, "class c {\n    prop1;\n    prop2;\n    prop3;\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addProperties"), () => {
    function doTest(startCode: string, structures: OptionalKindAndTrivia<PropertyDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addProperties(structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should add multiple at end", () => {
      doTest("class c {\n    prop1;\n}", [{ name: "prop2" }, { name: "prop3" }], "class c {\n    prop1;\n    prop2;\n    prop3;\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addProperty"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<PropertyDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addProperty(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(PropertyDeclaration);
    }

    it("should add at end", () => {
      doTest("class c {\n    prop1;\n}", { name: "prop2" }, "class c {\n    prop1;\n    prop2;\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getProperty"), () => {
    const code = "class Identifier { member() {} get member() {} set member() {} static member: string; member2: string; }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getProperty("member")!.getText()).to.equal("static member: string;");
    });

    it("should return undefined when it doesn't exists", () => {
      expect(firstChild.getProperty("member3")).to.be.undefined;
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getPropertyOrThrow"), () => {
    const code = "class Identifier { member() {} get member() {} set member() {} static member: string; member2: string; }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getPropertyOrThrow("member2").getText()).to.equal("member2: string;");
    });

    it("should throw when it doesn't exists", () => {
      expect(() => firstChild.getPropertyOrThrow("member3")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getGetAccessor"), () => {
    const code = "class Identifier { member() {} get member() {} set member() {} static member: string; member2: string; }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getGetAccessor("member")!.getText()).to.equal("get member() {}");
    });

    it("should return undefined when it doesn't exists", () => {
      expect(firstChild.getGetAccessor("member3")).to.be.undefined;
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getGetAccessorOrThrow"), () => {
    const code = "class Identifier { member() {} get member() {} set member() {} static member: string; member2: string; }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getGetAccessorOrThrow("member").getText()).to.equal("get member() {}");
    });

    it("should throw when it doesn't exists", () => {
      expect(() => firstChild.getGetAccessorOrThrow("member3")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getSetAccessor"), () => {
    const code = "class Identifier { member() {} get member() {} set member() {} static member: string; member2: string; }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getSetAccessor("member")!.getText()).to.equal("set member() {}");
    });

    it("should return undefined when it doesn't exists", () => {
      expect(firstChild.getSetAccessor("member3")).to.be.undefined;
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getSetAccessorOrThrow"), () => {
    const code = "class Identifier { member() {} get member() {} set member() {} static member: string; member2: string; }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getSetAccessorOrThrow("member").getText()).to.equal("set member() {}");
    });

    it("should throw when it doesn't exists", () => {
      expect(() => firstChild.getSetAccessorOrThrow("member3")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertSetAccessors"), () => {
    function doTest(startCode: string, insertIndex: number, structures: OptionalKindAndTrivia<SetAccessorDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertSetAccessors(insertIndex, structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should insert when none exists", () => {
      doTest("class c {\n}", 0, [{ name: "identifier" }], "class c {\n    set identifier() {\n    }\n}");
    });

    it("should insert multiple into other methods", () => {
      doTest(
        "class c {\n//1\n    m1() {\n    }\n\n    m4() {\n    }\n}",
        2,
        [{ isStatic: true, name: "m2", returnType: "string" }, { name: "m3" }],
        "class c {\n//1\n    m1() {\n    }\n\n    static set m2(): string {\n    }\n\n    set m3() {\n    }\n\n    m4() {\n    }\n}",
      );
    });

    it("should insert into ambient class", () => {
      doTest("declare class c {\n}", 0, [{ name: "s1", returnType: "string" }], "declare class c {\n    set s1(): string;\n}");
    });

    it("should insert all the properties of the structure", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<SetAccessorDeclarationStructure>> = {
        decorators: [{ name: "dec" }],
        isAbstract: false,
        isStatic: true,
        name: "prop",
        docs: [{ description: "Test" }],
        scope: Scope.Public,
        parameters: [{ name: "param" }],
        returnType: "number",
        typeParameters: [{ name: "T" }],
        statements: [{ kind: StructureKind.Class, name: "C" }, "console.log('here');"],
      };
      doTest(
        "class c {\n}",
        0,
        [structure],
        "class c {\n    /** Test */\n    @dec\n    public static set prop<T>(param): number {\n"
          + "        class C {\n        }\n\n        console.log('here');\n"
          + "    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertSetAccessor"), () => {
    function doTest(startCode: string, insertIndex: number, structure: OptionalKindAndTrivia<SetAccessorDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertSetAccessor(insertIndex, structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(SetAccessorDeclaration);
    }

    it("should insert", () => {
      doTest(
        "class c {\n    m1() {\n    }\n\n    m3() {\n    }\n}",
        1,
        { name: "m2" },
        "class c {\n    m1() {\n    }\n\n    set m2() {\n    }\n\n    m3() {\n    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addSetAccessors"), () => {
    function doTest(startCode: string, structures: OptionalKindAndTrivia<SetAccessorDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addSetAccessors(structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should add multiple", () => {
      doTest(
        "class c {\n    m1() {\n    }\n}",
        [{ name: "m2" }, { name: "m3" }],
        "class c {\n    m1() {\n    }\n\n    set m2() {\n    }\n\n    set m3() {\n    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addSetAccessor"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<SetAccessorDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addSetAccessor(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(SetAccessorDeclaration);
    }

    it("should insert", () => {
      doTest("class c {\n    m1() {\n    }\n}", { name: "m2" }, "class c {\n    m1() {\n    }\n\n    set m2() {\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceProperties"), () => {
    describe("no properties", () => {
      it("should not have any properties", () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
        expect(firstChild.getInstanceProperties().length).to.equal(0);
      });
    });

    describe("has properties", () => {
      const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
        + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
        + "instanceProp: string;\nprop2: number;method1() {}\n"
        + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
      const { firstChild } = getInfoFromText<ClassDeclaration>(code);

      it("should get the right number of properties", () => {
        expect(firstChild.getInstanceProperties().length).to.equal(6);
      });

      it("should get a property of the right instance of for parameter with a scope", () => {
        expect(firstChild.getInstanceProperties()[0]).to.be.instanceOf(ParameterDeclaration);
        expect(firstChild.getInstanceProperties()[0].getName()).to.equal("param2");
      });

      it("should get a property of the right instance of for parameter with readonly keyword", () => {
        expect(firstChild.getInstanceProperties()[1]).to.be.instanceOf(ParameterDeclaration);
        expect(firstChild.getInstanceProperties()[1].getName()).to.equal("param3");
      });

      it("should get a property of the right instance of", () => {
        expect(firstChild.getInstanceProperties()[2]).to.be.instanceOf(PropertyDeclaration);
      });

      it("should get a property of the right instance of for the get accessor", () => {
        expect(firstChild.getInstanceProperties()[4]).to.be.instanceOf(GetAccessorDeclaration);
      });

      it("should get a property of the right instance of for the set accessor", () => {
        expect(firstChild.getInstanceProperties()[5]).to.be.instanceOf(SetAccessorDeclaration);
      });
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceProperty"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method1() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a property by name", () => {
      const prop = firstChild.getInstanceProperty("prop2")! as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(false);
    });

    it("should get a property by function", () => {
      const prop = firstChild.getInstanceProperty(p => p.getName() === "prop2")! as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(false);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstancePropertyOrThrow"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method1() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a property by name", () => {
      const prop = firstChild.getInstancePropertyOrThrow("prop2") as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(false);
    });

    it("should get a property by function", () => {
      const prop = firstChild.getInstancePropertyOrThrow(p => p.getName() === "prop2") as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(false);
    });

    it("should throw when not found", () => {
      expect(() => firstChild.getInstancePropertyOrThrow(p => p.getName() === "prop9")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticProperty"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method1() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a property by name", () => {
      const prop = firstChild.getStaticProperty("prop2")! as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(true);
    });

    it("should get a property by function", () => {
      const prop = firstChild.getStaticProperty(p => p.getName() === "prop2")! as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(true);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticPropertyOrThrow"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method1() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a property by name", () => {
      const prop = firstChild.getStaticPropertyOrThrow("prop2") as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(true);
    });

    it("should get a property by function", () => {
      const prop = firstChild.getStaticPropertyOrThrow(p => p.getName() === "prop2") as PropertyDeclaration;
      expect(prop.getName()).to.equal("prop2");
      expect(prop.isStatic()).to.equal(true);
    });

    it("should throw when not found", () => {
      expect(() => firstChild.getStaticPropertyOrThrow(p => p.getName() === "prop9")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticProperties"), () => {
    describe("no static properties", () => {
      it("should not have any properties", () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
        expect(firstChild.getStaticProperties().length).to.equal(0);
      });
    });

    describe("has static properties", () => {
      const code =
        "class Identifier {\nconstructor(public p: string) {}\nstatic prop2: string;\nstatic method() {}\nprop: string;\nprop2: number;method1() {}\n"
        + "\nstatic get prop(): string { return ''; }\nstatic set prop(val: string) {}\n}";
      const { firstChild } = getInfoFromText<ClassDeclaration>(code);

      it("should get the right number of static properties", () => {
        expect(firstChild.getStaticProperties().length).to.equal(3);
      });

      it("should get a property of the right instance of", () => {
        expect(firstChild.getStaticProperties()[0]).to.be.instanceOf(PropertyDeclaration);
      });

      it("should get a property of the right instance of for the get accessor", () => {
        expect(firstChild.getStaticProperties()[1]).to.be.instanceOf(GetAccessorDeclaration);
      });

      it("should get a property of the right instance of for the set accessor", () => {
        expect(firstChild.getStaticProperties()[2]).to.be.instanceOf(SetAccessorDeclaration);
      });
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertMethods"), () => {
    function doTest(startCode: string, insertIndex: number, structures: OptionalKindAndTrivia<MethodDeclarationStructure>[], expectedCode: string) {
      const { descendant, sourceFile } = getInfoFromTextWithDescendant<ClassDeclaration>(startCode, SyntaxKind.ClassDeclaration);
      const result = descendant.insertMethods(insertIndex, structures);
      expect(sourceFile.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should insert when none exists", () => {
      doTest("class c {\n}", 0, [{ name: "myMethod" }], "class c {\n    myMethod() {\n    }\n}");
    });

    it("should insert multiple into other methods", () => {
      doTest(
        "class c {\n//1\n    m1() {\n    }\n\n    m4() {\n    }\n}",
        2,
        [{ isStatic: true, name: "m2", returnType: "string" }, { name: "m3" }],
        "class c {\n//1\n    m1() {\n    }\n\n    static m2(): string {\n    }\n\n    m3() {\n    }\n\n    m4() {\n    }\n}",
      );
    });

    it("should insert all the properties of the structure", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<MethodDeclarationStructure>> = {
        decorators: [{ name: "dec" }],
        isAbstract: false,
        isStatic: true,
        name: "myMethod",
        docs: [{ description: "Test" }],
        scope: Scope.Public,
        isAsync: true,
        isGenerator: true,
        hasQuestionToken: true,
        hasOverrideKeyword: true,
        overloads: [{}, { scope: Scope.Private, isStatic: false, hasQuestionToken: false }],
        parameters: [{ name: "param" }],
        returnType: "number",
        typeParameters: [{ name: "T" }],
        statements: [{ kind: StructureKind.Class, name: "C" }, "console.log('here');"],
      };
      doTest(
        "class c {\n}",
        0,
        [structure],
        "class c {\n    public static myMethod?();\n    private myMethod();\n"
          + "    /** Test */\n    @dec\n    public static override async myMethod?<T>(param): number {\n"
          + "        class C {\n        }\n\n        console.log('here');\n"
          + "    }\n}",
      );
    });

    it("should write as ambient when inserting into a insert when none exists", () => {
      doTest("declare module Ambient { class c {\n} }", 0, [{ name: "method" }], "declare module Ambient { class c {\n    method();\n} }");
    });

    it("should not write an abstract method's body", () => {
      doTest("class c {\n}", 0, [{ name: "method", isAbstract: true }], "class c {\n    abstract method();\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("insertMethod"), () => {
    function doTest(startCode: string, insertIndex: number, structure: OptionalKindAndTrivia<MethodDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.insertMethod(insertIndex, structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(MethodDeclaration);
    }

    it("should insert", () => {
      doTest(
        "class c {\n    m1() {\n    }\n\n    m3() {\n    }\n}",
        1,
        { name: "m2" },
        "class c {\n    m1() {\n    }\n\n    m2() {\n    }\n\n    m3() {\n    }\n}",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addMethods"), () => {
    function doTest(startCode: string, structures: OptionalKindAndTrivia<MethodDeclarationStructure>[], expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addMethods(structures);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should add multiple", () => {
      doTest("class c {\n    m1() {\n    }\n}", [{ name: "m2" }, { name: "m3" }], "class c {\n    m1() {\n    }\n\n    m2() {\n    }\n\n    m3() {\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("addMethod"), () => {
    function doTest(startCode: string, structure: OptionalKindAndTrivia<MethodDeclarationStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<ClassDeclaration>(startCode);
      const result = firstChild.addMethod(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(MethodDeclaration);
    }

    it("should insert", () => {
      doTest("class c {\n    m1() {\n    }\n}", { name: "m2" }, "class c {\n    m1() {\n    }\n\n    m2() {\n    }\n}");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getMethod"), () => {
    const code = "class Identifier { get member() {} set member() {} static member: string; member() {} }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getMethod("member")!.getText()).to.equal("member() {}");
    });

    it("should return undefined when it doesn't exists", () => {
      expect(firstChild.getMethod("member3")).to.be.undefined;
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getMethodOrThrow"), () => {
    const code = "class Identifier { get member() {} set member() {} static member: string; member() {} }\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a member when it exists", () => {
      expect(firstChild.getMethodOrThrow("member").getText()).to.equal("member() {}");
    });

    it("should throw when it doesn't exists", () => {
      expect(() => firstChild.getMethodOrThrow("member3")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceMethods"), () => {
    describe("no methods", () => {
      it("should not have any methods", () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
        expect(firstChild.getInstanceMethods().length).to.equal(0);
      });
    });

    describe("has methods", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>(`class Identifier {
    static prop2: string;
    static method() {}
    prop: string;
    method1() {}
    method2() {}
    abstract method3(): void;
}\n`);

      it("should get the right number of methods", () => {
        expect(firstChild.getInstanceMethods().length).to.equal(3);
      });

      it("should get a method of the right instance of", () => {
        expect(firstChild.getInstanceMethods()[0]).to.be.instanceOf(MethodDeclaration);
      });
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceMethod"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getInstanceMethod("method")!;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });

    it("should get a method by function", () => {
      const method = firstChild.getInstanceMethod(m => m.getName() === "method")!;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceMethodOrThrow"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getInstanceMethodOrThrow("method");
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });

    it("should get a method by function", () => {
      const method = firstChild.getInstanceMethodOrThrow(m => m.getName() === "method");
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });

    it("should throw when not found", () => {
      expect(() => firstChild.getInstanceMethodOrThrow(m => m.getName() === "method9")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticMethods"), () => {
    describe("no static methods", () => {
      it("should not have any static methods", () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
        expect(firstChild.getStaticMethods().length).to.equal(0);
      });
    });

    describe("has static methods", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>(
        "class Identifier {\nstatic prop2: string;\nstatic method() {}\nprop: string;\nmethod1() {}\nmethod2() {}\n}\n",
      );

      it("should get the right number of static methods", () => {
        expect(firstChild.getStaticMethods().length).to.equal(1);
      });

      it("should get a method of the right instance of", () => {
        expect(firstChild.getStaticMethods()[0]).to.be.instanceOf(MethodDeclaration);
      });
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticMethod"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getStaticMethod("method")!;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });

    it("should get a property by function", () => {
      const method = firstChild.getStaticMethod(m => m.getName() === "method")!;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticMethodOrThrow"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getStaticMethodOrThrow("method");
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });

    it("should get a property by function", () => {
      const method = firstChild.getStaticMethodOrThrow(m => m.getName() === "method");
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });

    it("should throw when not found", () => {
      expect(() => firstChild.getStaticMethodOrThrow(m => m.getName() === "method9")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceMembers"), () => {
    const { firstChild } = getInfoFromText<ClassDeclaration>(
      "class Identifier {\nconstructor(public p: string) {}\nstatic prop2: string;\nstatic method() {}\nprop: string;\n"
        + "prop2: number;method1() {}\n}\n",
    );
    it("should get the right number of instance members", () => {
      expect(firstChild.getInstanceMembers().length).to.equal(4);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceMember"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getInstanceMember("method")! as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });

    it("should get a parameter property by name", () => {
      const method = firstChild.getInstanceMember("param3")! as ParameterDeclaration;
      expect(method.getName()).to.equal("param3");
    });

    it("should get a method by function", () => {
      const method = firstChild.getInstanceMember(m => m.getName() === "method")! as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getInstanceMemberOrThrow"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getInstanceMemberOrThrow("method") as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });

    it("should get a method by function", () => {
      const method = firstChild.getInstanceMemberOrThrow(m => m.getName() === "method") as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(false);
    });

    it("should throw when not found", () => {
      expect(() => firstChild.getInstanceMemberOrThrow(m => m.getName() === "method9")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticMembers"), () => {
    const { firstChild } = getInfoFromText<ClassDeclaration>(
      "class Identifier {\nconstructor(public p: string) {}\nstatic prop2: string;\nstatic method() {}\nprop: string;\n"
        + "prop2: number;method1() {}\n}\n",
    );
    it("should get the right number of static members", () => {
      expect(firstChild.getStaticMembers().length).to.equal(2);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticMember"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getStaticMember("method")! as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });

    it("should get a property by function", () => {
      const method = firstChild.getStaticMember(m => m.getName() === "method")! as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getStaticMemberOrThrow"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getStaticMemberOrThrow("method") as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });

    it("should get a property by function", () => {
      const method = firstChild.getStaticMemberOrThrow(m => m.getName() === "method") as MethodDeclaration;
      expect(method.getName()).to.equal("method");
      expect(method.isStatic()).to.equal(true);
    });

    it("should throw when not found", () => {
      expect(() => firstChild.getStaticMemberOrThrow(m => m.getName() === "method9")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getMembers"), () => {
    it("should get the right number of instance, static, and constructor members in a non-ambient context", () => {
      const code = "class Identifier {\nconstructor();constructor(public param) {}\nstatic prop2: string;\nstatic method();"
        + "static method() { }\nabstract abstractMethod(): void; \n"
        + "prop: string;\nprop2: number;method1(str);method1() {}\n}\n";
      const { firstChild } = getInfoFromText<ClassDeclaration>(code);
      expect(firstChild.getMembers().length).to.equal(7);
    });

    it("should get the right number of instance, static, and constructor members in an ambient context", () => {
      const code = "declare class Identifier {\nconstructor();constructor();\nstatic prop2: string;\nstatic method();static method();\n"
        + "prop: string;\nprop2: number;method1(str);method1();\n}\n";
      const { firstChild } = getInfoFromText<ClassDeclaration>(code);
      expect(firstChild.getMembers().length).to.equal(9);
    });

    it("should not get any class element comments in a class with other members", () => {
      const code = "class C {\n  //a\n  p;\n  /*b*/\n}";
      const { firstChild } = getInfoFromText<ClassDeclaration>(code);
      const members = firstChild.getMembers();
      expect(members.map(m => m.getText())).to.deep.equal(["p;"]);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getMembersWithComments"), () => {
    it("should get any class element comments in an empty class", () => {
      const code = "class C {\n  //a\n  /*b*/\n}";
      const { firstChild } = getInfoFromText<ClassDeclaration>(code);
      const members = firstChild.getMembersWithComments();
      expect(members.map(m => m.getText())).to.deep.equal([
        "//a",
        "/*b*/",
      ]);
      expect(members[0]).to.be.instanceOf(CommentClassElement);
      expect(members[1]).to.be.instanceOf(CommentClassElement);
    });

    it("should get any class element comments in a class with other members", () => {
      const code = "class C {\n  //a\n  p;\n  /*b*/\n}";
      const { firstChild } = getInfoFromText<ClassDeclaration>(code);
      const members = firstChild.getMembersWithComments();
      expect(members.map(m => m.getText())).to.deep.equal([
        "//a",
        "p;",
        "/*b*/",
      ]);
    });
  });

  describe("inserting members", () => {
    it("should insert methods and properties in the correct location when constructor parameters and overload signatures exist", () => {
      const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(`
class c {
    constructor();
    constructor(public param: string) {}

    myMethod(): void;
    myMethod(): void {
    }
}
`);
      firstChild.insertProperty(1, { name: "prop2" });
      firstChild.insertMethod(1, { name: "method" });
      firstChild.insertProperty(0, { name: "prop1" });
      expect(sourceFile.getFullText()).to.equal(`
class c {
    prop1;

    constructor();
    constructor(public param: string) {}

    method() {
    }

    prop2;

    myMethod(): void;
    myMethod(): void {
    }
}
`);
    });

    it("should insert a constructor in the correct location when constructor parameters and overload signatures exist", () => {
      const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(`
class c {
    constructor();
    constructor(public param: string) {}

    myMethod(): void;
    myMethod(): void {
    }
}
`);
      firstChild.insertConstructor(2, {});
      expect(sourceFile.getFullText()).to.equal(`
class c {
    constructor();
    constructor(public param: string) {}

    myMethod(): void;
    myMethod(): void {
    }

    constructor() {
    }
}
`);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getMember"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getMember("method")! as MethodDeclaration;
      expect(method.getName()).to.equal("method");
    });

    it("should get a property by function", () => {
      const method = firstChild.getMember(m => Node.isMethodDeclaration(m) && m.getName() === "method")! as MethodDeclaration;
      expect(method.getName()).to.equal("method");
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getMemberOrThrow"), () => {
    const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\n"
      + "constructor(param: string, public param2: string, readonly param3: string) {}\n"
      + "instanceProp: string;\nprop2: number;method() {}\n"
      + "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should get a method by name", () => {
      const method = firstChild.getMemberOrThrow("method") as MethodDeclaration;
      expect(method.getName()).to.equal("method");
    });

    it("should get a property by function", () => {
      const method = firstChild.getMemberOrThrow(m => Node.isMethodDeclaration(m) && m.getName() === "method") as MethodDeclaration;
      expect(method.getName()).to.equal("method");
    });

    it("should throw when not found", () => {
      expect(() => firstChild.getMemberOrThrow(m => Node.isMethodDeclaration(m) && m.getName() === "method9")).to.throw();
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getBaseTypes"), () => {
    function doTest(text: string, className: string, expectedNames: string[]) {
      const { sourceFile } = getInfoFromText(text, {
        includeLibDts: true, // need to include the lib files... see TS issue #34963
      });
      const types = sourceFile.getClassOrThrow(className).getBaseTypes();
      expect(types.map(c => c.getText())).to.deep.equal(expectedNames);
    }

    it("should get the base when it's a class", () => {
      doTest("class Base {} class Child extends Base {}", "Child", ["Base"]);
    });

    it("should be empty when there is no base class", () => {
      doTest("class Class {}", "Class", []);
    });

    it("should be empty when it implements a class", () => {
      doTest("class Base { name: string; } class Child implements Base {}", "Child", []);
    });

    it("should get the mixin type", () => {
      doTest(
        `
type Constructor<T> = new (...args: any[]) => T;
class Base { prop!: string; }
interface Mixin {
    getResult(): number;
}

function Mixin<T extends Constructor<{}>>(Base: T): Constructor<Mixin> & T {
    return class extends Base implements Mixin {
        getResult() {
            return 5;
        }
    }
}

class Child extends Mixin(Base) {}
`,
        "Child",
        ["Mixin & Base"],
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getBaseClass"), () => {
    function doTest(text: string, className: string, expectedName: string | undefined) {
      const { sourceFile } = getInfoFromText(text, {
        includeLibDts: true, // need to include the lib files... see TS issue #34963
      });
      const c = sourceFile.getClassOrThrow(className).getBaseClass();
      if (typeof expectedName === "undefined")
        expect(c).to.be.undefined;
      else {
        expect(c).to.not.be.undefined;
        expect(c!.getName()).to.equal(expectedName);
      }
    }

    it("should get the base when it's a class", () => {
      doTest("class Base {} class Child extends Base {}", "Child", "Base");
    });

    it("should be undefined when there is no base class", () => {
      doTest("class Class {}", "Class", undefined);
    });

    it("should be undefined when it implements a class", () => {
      doTest("class Base {} class Child implements Base {}", "Child", undefined);
    });

    it("should get the base class that's mixined", () => {
      doTest(
        `
type Constructor<T> = new (...args: any[]) => T;
class Base {}

function Mixin<T extends Constructor<{}>>(Base: T) {
    return class extends Base {}
}

class Child extends Mixin(Base) {}
`,
        "Child",
        "Base",
      );
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getBaseClassOrThrow"), () => {
    function doTest(text: string, className: string, expectedName: string | undefined) {
      const { sourceFile } = getInfoFromText(text);
      if (typeof expectedName === "undefined")
        expect(() => sourceFile.getClassOrThrow(className).getBaseClassOrThrow()).to.throw();
      else
        expect(sourceFile.getClassOrThrow(className).getBaseClassOrThrow().getName()).to.equal(expectedName);
    }

    it("should get the base when it's a class", () => {
      doTest("class Base {} class Child extends Base {}", "Child", "Base");
    });

    it("should throw when there is no base class", () => {
      doTest("class Class {}", "Class", undefined);
    });
  });

  describe(nameof<ClassLikeDeclarationBase>("getDerivedClasses"), () => {
    function doTest(text: string, className: string, expectedNames: string[]) {
      const { sourceFile } = getInfoFromText(text);
      const classes = sourceFile.getClassOrThrow(className).getDerivedClasses();
      expect(classes.map(c => c.getName())).to.deep.equal(expectedNames);
    }

    it("should get the class descendants", () => {
      doTest(
        "class Base {} class Child1 extends Base {} class Child2 extends Base {} class Grandchild1<T> extends Child1 {} class GreatGrandChild1<T> extends Grandchild1<T> {}",
        "Base",
        ["Child1", "Child2", "Grandchild1", "GreatGrandChild1"],
      );
    });

    it("should not blow up for a circular references", () => {
      doTest(
        "class Base extends GreatGrandChild1 {} class Child1 extends Base {} class Child2 extends Base {} class Grandchild1 extends Child1 {} "
          + "class GreatGrandChild1 extends Grandchild1 {}",
        "Base",
        ["Child1", "Child2", "Grandchild1", "GreatGrandChild1"],
      );
    });

    it("should ignore Interfaces that extend classes", () => {
      doTest("class Base {} interface InterfaceExtendsClass extends Base {} class Child1 extends Base {}", "Base", ["Child1"]);
    });

    it("should get the class descendants when there are none", () => {
      doTest("class Base {} class Child1 extends Base {} class Child2 extends Base {} class Grandchild1 extends Child1 {}", "Grandchild1", []);
    });
  });
});
