import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { CommentEnumMember, EnumDeclaration, EnumMember } from "../../../../compiler";
import { EnumDeclarationSpecificStructure, EnumDeclarationStructure, EnumMemberStructure, OptionalKind, StructureKind } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { MakeRequired } from "../../../../typings";
import { fillStructures, getInfoFromText, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

describe("EnumDeclaration", () => {
  describe(nameof<EnumDeclaration>("getMember"), () => {
    it("should get a member by its name", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
      expect(firstChild.getMember("member2")!.getText()).to.equal("member2");
    });

    it("should get a member by a function", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
      expect(firstChild.getMember(m => m.getName() === "member2")!.getText()).to.equal("member2");
    });
  });

  describe(nameof<EnumDeclaration>("getMemberOrThrow"), () => {
    it("should get a member by its name", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
      expect(firstChild.getMemberOrThrow("member2").getText()).to.equal("member2");
    });

    it("should get a member by a function", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
      expect(firstChild.getMemberOrThrow(m => m.getName() === "member2").getText()).to.equal("member2");
    });

    it("should get a member by a function", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
      expect(() => firstChild.getMemberOrThrow(m => m.getName() === "member9")).to.throw();
    });
  });

  describe(nameof<EnumDeclaration>("getMembers"), () => {
    it("should get all the members not including comments", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {\nmember1 = 1,\nmember2\n//a\n}");
      const members = firstChild.getMembers();
      expect(members.length).to.equal(2);
    });
  });

  describe(nameof<EnumDeclaration>("getMembersWithComments"), () => {
    it("should get all the members including comments", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {\nmember1 = 1,\nmember2\n//a\n}");
      const members = firstChild.getMembersWithComments().map(m => m.getText());
      expect(members).to.deep.equal([
        "member1 = 1",
        "member2",
        "//a",
      ]);
    });
  });

  describe(nameof<EnumDeclaration>("insertMembers"), () => {
    function doTest(startCode: string, index: number, structures: OptionalKind<EnumMemberStructure>[], expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
      const result = firstChild.insertMembers(index, structures);
      assert<IsExact<typeof result, EnumMember[]>>(true);

      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should insert a member without a value", () => {
      doTest("enum MyEnum {\n}\n", 0, [{ name: "myName" }], "enum MyEnum {\n    myName\n}\n");
    });

    it("should insert a member with a number value", () => {
      doTest("enum MyEnum {\n}\n", 0, [{ name: "myName", value: 5 }], "enum MyEnum {\n    myName = 5\n}\n");
    });

    it("should insert a member with an initializer", () => {
      doTest("enum MyEnum {\n}\n", 0, [{ name: "myName", initializer: "SomeKind" }], "enum MyEnum {\n    myName = SomeKind\n}\n");
    });

    it("should insert a member with a string value", () => {
      doTest("enum MyEnum {\n}\n", 0, [{ name: "myName", value: "str" }], "enum MyEnum {\n    myName = \"str\"\n}\n");
    });

    it("should insert a member and add a comma to the previous member when no comma exists", () => {
      doTest("enum MyEnum {\n    member1\n}\n", 1, [{ name: "member2" }], "enum MyEnum {\n    member1,\n    member2\n}\n");
    });

    it("should insert a member when a comma exists", () => {
      doTest("enum MyEnum {\n    member1,\n}\n", 1, [{ name: "member2" }], "enum MyEnum {\n    member1,\n    member2\n}\n");
    });

    it("should insert a member handling comment ranges before and after the comma", () => {
      doTest("enum MyEnum {\n    member1/*1*/,//test\n}\n", 1, [{ name: "member2" }], "enum MyEnum {\n    member1/*1*/,//test\n    member2\n}\n");
    });

    it("should insert a member adding a comma before the comment", () => {
      doTest("enum MyEnum {\n    member1 //test\n}\n", 1, [{ name: "member2" }], "enum MyEnum {\n    member1, //test\n    member2\n}\n");
    });

    it("should insert in the middle", () => {
      doTest(
        "enum MyEnum {\n    member1,\n    member3\n}\n",
        1,
        [{ name: "member2" }],
        "enum MyEnum {\n    member1,\n    member2,\n    member3\n}\n",
      );
    });

    it("should insert multiple", () => {
      doTest(
        "enum MyEnum {\n}\n",
        0,
        [
          { leadingTrivia: "// a", name: "member1", trailingTrivia: " // testing" },
          { name: "member2", value: 2, docs: [{ description: "description" }] },
          { name: "member3" },
        ],
        "enum MyEnum {\n    // a\n    member1, // testing\n    /** description */\n    member2 = 2,\n    member3\n}\n",
      );
    });

    it("should insert for all the structure's properties", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<EnumMemberStructure>> = {
        docs: [{ description: "testing" }],
        initializer: "5",
        value: 5,
        name: "member",
      };
      doTest(
        "enum MyEnum {\n}\n",
        0,
        [structure],
        "enum MyEnum {\n    /** testing */\n    member = 5\n}\n",
      );
    });

    type WriterStructureType = (OptionalKind<EnumMemberStructure> | WriterFunction | string)[] | string | WriterFunction;
    function doWriterTest(
      startCode: string,
      index: number,
      structures: WriterStructureType,
      expectedCode: string,
      options?: { useTrailingCommas?: boolean },
    ) {
      const { firstChild, sourceFile, project } = getInfoFromText<EnumDeclaration>(startCode);
      if (options && options.useTrailingCommas)
        project.manipulationSettings.set({ useTrailingCommas: true });
      const result = firstChild.insertMembers(index, structures);
      assert<IsExact<typeof result, (EnumMember | CommentEnumMember)[]>>(true);

      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures instanceof Array ? structures.length : 1);
    }

    it("should insert with comments", () => {
      doWriterTest("enum MyEnum {\n}\n", 0, [
        writer => writer.write("// testing"),
        writer => writer.write("asdf"),
        writer => writer.write("test"),
        writer => writer.write("// test"),
      ], "enum MyEnum {\n    // testing\n    asdf,\n    test\n    // test\n}\n");
    });

    it("should insert when using only a writer", () => {
      doWriterTest(
        "enum MyEnum {\n}\n",
        0,
        writer => writer.write("// testing"),
        "enum MyEnum {\n    // testing\n}\n",
      );
    });

    it("should insert when using only a string", () => {
      doWriterTest(
        "enum MyEnum {\n}\n",
        0,
        "// testing",
        "enum MyEnum {\n    // testing\n}\n",
      );
    });

    it("should support trailing commas", () => {
      doWriterTest(
        "enum MyEnum {\n}\n",
        0,
        "member",
        "enum MyEnum {\n    member,\n}\n",
        { useTrailingCommas: true },
      );
    });
  });

  describe(nameof<EnumDeclaration>("insertMember"), () => {
    function doTest(startCode: string, index: number, structure: OptionalKind<EnumMemberStructure>, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
      const result = firstChild.insertMember(index, structure);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(EnumMember);
    }

    it("should insert a member", () => {
      doTest("enum MyEnum {\n    member2\n}\n", 0, { name: "member1" }, "enum MyEnum {\n    member1,\n    member2\n}\n");
    });
  });

  const appendWithCommentsTestCases = [
    {
      description: "interspersed comments",
      startCode: "enum MyEnum {\n    // first\n    member1,\n    // second\n    member2,\n    member3,\n}\n",
      expectedCode: "enum MyEnum {\n    // first\n    member1,\n    // second\n    member2,\n    member3,\n    member4,\n    member5\n}\n",
    },
    {
      description: "interspersed and trailing comments",
      startCode: "enum MyEnum {\n    // first\n    member1,\n    // second\n    member2,\n    member3\n    // trailing\n}\n",
      expectedCode: "enum MyEnum {\n    // first\n    member1,\n    // second\n    member2,\n    member3,\n    // trailing\n    member4,\n    member5\n}\n",
    },
    {
      description: "trailing comments",
      startCode: "enum MyEnum {\n    member1,\n    member2,\n    member3\n    // trailing\n}\n",
      expectedCode: "enum MyEnum {\n    member1,\n    member2,\n    member3,\n    // trailing\n    member4,\n    member5\n}\n",
    },
    {
      description: "a trailing comma and trailing comments",
      startCode: "enum MyEnum {\n    member1,\n    member2,\n    member3,\n    // trailing\n}\n",
      expectedCode: "enum MyEnum {\n    member1,\n    member2,\n    member3,\n    // trailing\n    member4,\n    member5\n}\n",
    },
    {
      description: "interspersed and trailing comments with a trailing comma",
      startCode: "enum MyEnum {\n    // first\n    member1,\n    // second\n    member2,\n    member3,\n    // trailing\n}\n",
      expectedCode: "enum MyEnum {\n    // first\n    member1,\n    // second\n    member2,\n    member3,\n    // trailing\n    member4,\n    member5\n}\n",
    },
  ];

  describe(nameof<EnumDeclaration>("addMember"), () => {
    function doTest(startCode: string, structure: OptionalKind<EnumMemberStructure>, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
      const result = firstChild.addMember(structure);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result).to.be.instanceOf(EnumMember);
    }

    it("should add a member", () => {
      doTest("enum MyEnum {\n    member1\n}\n", { name: "member2" }, "enum MyEnum {\n    member1,\n    member2\n}\n");
    });

    for (const { description, startCode, expectedCode } of appendWithCommentsTestCases) {
      it(`should append repeatedly after ${description} without changing existing values`, () => {
        const { firstChild, sourceFile, project } = getInfoFromText<EnumDeclaration>(startCode);
        const existingMembers = firstChild.getMembers();
        const firstAdded = firstChild.addMember({ name: "member4" });
        expect(existingMembers.map(member => member.getValue())).to.deep.equal([0, 1, 2]);
        expect(project.getLanguageService().compilerObject.getSyntacticDiagnostics(sourceFile.getFilePath()).map(d => d.code)).to.deep.equal([]);
        const secondAdded = firstChild.addMember({ name: "member5" });

        expect(existingMembers.map(member => member.getValue())).to.deep.equal([0, 1, 2]);
        expect(firstAdded).to.be.instanceOf(EnumMember);
        expect(secondAdded).to.be.instanceOf(EnumMember);
        expect(firstAdded).to.equal(firstChild.getMembers()[3]);
        expect(secondAdded).to.equal(firstChild.getMembers()[4]);
        expect([firstAdded.getName(), secondAdded.getName()]).to.deep.equal(["member4", "member5"]);
        expect([firstAdded.getValue(), secondAdded.getValue()]).to.deep.equal([3, 4]);
        expect(project.getLanguageService().compilerObject.getSyntacticDiagnostics(sourceFile.getFilePath()).map(d => d.code)).to.deep.equal([]);
        expect(sourceFile.getFullText()).to.equal(expectedCode);
      });
    }
  });

  describe(nameof<EnumDeclaration>("addMembers"), () => {
    function doTest(startCode: string, structures: OptionalKind<EnumMemberStructure>[], expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
      const result = firstChild.addMembers(structures);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
      expect(result.length).to.equal(structures.length);
    }

    it("should add members", () => {
      doTest(
        "enum MyEnum {\n    member1\n}\n",
        [{ name: "member2" }, { name: "member3" }],
        "enum MyEnum {\n    member1,\n    member2,\n    member3\n}\n",
      );
    });

    for (const { description, startCode, expectedCode } of appendWithCommentsTestCases) {
      it(`should append a batch after ${description} without changing existing values`, () => {
        const { firstChild, sourceFile, project } = getInfoFromText<EnumDeclaration>(startCode);
        const existingMembers = firstChild.getMembers();
        const result = firstChild.addMembers([{ name: "member4" }, { name: "member5" }]);
        assert<IsExact<typeof result, EnumMember[]>>(true);

        expect(existingMembers.map(member => member.getValue())).to.deep.equal([0, 1, 2]);
        expect(result.length).to.equal(2);
        expect(result[0]).to.be.instanceOf(EnumMember);
        expect(result[1]).to.be.instanceOf(EnumMember);
        expect(result[0]).to.equal(firstChild.getMembers()[3]);
        expect(result[1]).to.equal(firstChild.getMembers()[4]);
        expect(result.map(member => member.getName())).to.deep.equal(["member4", "member5"]);
        expect(result.map(member => member.getValue())).to.deep.equal([3, 4]);
        expect(project.getLanguageService().compilerObject.getSyntacticDiagnostics(sourceFile.getFilePath()).map(d => d.code)).to.deep.equal([]);
        expect(sourceFile.getFullText()).to.equal(expectedCode);
      });
    }
  });

  describe(nameof<EnumDeclaration>("isConstEnum"), () => {
    it("should have a const keyword when it has one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
      expect(firstChild.isConstEnum()).is.true;
    });

    it("should not have a const keyword when it doesn't have one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
      expect(firstChild.isConstEnum()).is.false;
    });
  });

  describe(nameof<EnumDeclaration>("getConstKeyword"), () => {
    it("should get a const keyword when it has one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
      expect(firstChild.getConstKeyword()!.getText()).to.equal("const");
    });

    it("should not get a const keyword when it doesn't have one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
      expect(firstChild.getConstKeyword()).is.undefined;
    });
  });

  describe(nameof<EnumDeclaration>("setIsConstEnum"), () => {
    it("should set as const enum when not one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
      firstChild.setIsConstEnum(true);
      expect(firstChild.getText()).to.equal("const enum MyEnum {}");
    });

    it("should set as not const enum when is one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
      firstChild.setIsConstEnum(false);
      expect(firstChild.getText()).to.equal("enum MyEnum {}");
    });

    it("should stay the same if setting to same value", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
      firstChild.setIsConstEnum(true);
      expect(firstChild.getText()).to.equal("const enum MyEnum {}");
    });

    it("should set as const exported enum when not one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("export enum MyEnum {}");
      firstChild.setIsConstEnum(true);
      expect(firstChild.getText()).to.equal("export const enum MyEnum {}");
    });

    it("should set as not const exported enum when is one", () => {
      const { firstChild } = getInfoFromText<EnumDeclaration>("export const enum MyEnum {}");
      firstChild.setIsConstEnum(false);
      expect(firstChild.getText()).to.equal("export enum MyEnum {}");
    });
  });

  describe(nameof<EnumDeclaration>("set"), () => {
    function doTest(startingCode: string, structure: OptionalKind<EnumDeclarationSpecificStructure>, expectedCode: string) {
      const { firstChild } = getInfoFromText<EnumDeclaration>(startingCode);
      firstChild.set(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
    }

    it("should not modify anything if the structure doesn't change anything", () => {
      const code = "enum Identifier {\n    member\n}";
      doTest(code, {}, code);
    });

    it("should replace existing members when changed", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<EnumDeclarationSpecificStructure>> = {
        isConst: true,
        members: [{
          name: "member",
        }],
      };
      doTest("enum Identifier {\n    m\n}", structure, "const enum Identifier {\n    member\n}");
    });

    it("should remove existing members when specifying an empty array", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<EnumDeclarationSpecificStructure>> = {
        isConst: true,
        members: [],
      };
      doTest("enum Identifier {\n    m\n}", structure, "const enum Identifier {\n}");
    });
  });

  describe(nameof<EnumDeclaration>("remove"), () => {
    function doTest(text: string, index: number, expectedText: string) {
      const { sourceFile } = getInfoFromText(text);
      sourceFile.getEnums()[index].remove();
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should remove the enum declaration", () => {
      doTest("enum I {}\n\nenum J {}\n\nenum K {}", 1, "enum I {}\n\nenum K {}");
    });
  });

  describe(nameof<EnumDeclaration>("getStructure"), () => {
    function doTest(code: string, expected: OptionalTrivia<MakeRequired<EnumDeclarationStructure>>) {
      const { firstChild } = getInfoFromText<EnumDeclaration>(code);
      const structure = firstChild.getStructure();
      expect(structure).to.deep.equal(fillStructures.enumDeclaration(expected));
    }

    it("should get structure of an empty enum", () => {
      doTest("declare enum Identifier {}", {
        kind: StructureKind.Enum,
        name: "Identifier",
        isExported: false,
        isDefaultExport: false,
        hasDeclareKeyword: true,
        docs: [],
        isConst: false,
        members: [],
      });
    });

    it("should get structure when enum has everything", () => {
      const code = `
/** test */
export const enum Enum {
    member
}
`;
      doTest(code, {
        kind: StructureKind.Enum,
        name: "Enum",
        isExported: true,
        isDefaultExport: false, // enums can't have a default keyword
        hasDeclareKeyword: false,
        docs: [{ description: "test" }],
        isConst: true,
        members: [{ name: "member" }],
      });
    });
  });
});
