﻿import { expect } from "chai";
import { EnumDeclaration, EnumMember } from "../../../../compiler";
import { EnumDeclarationSpecificStructure, EnumMemberStructure, EnumDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

describe(nameof(EnumDeclaration), () => {
    describe(nameof<EnumDeclaration>(d => d.getMember), () => {
        it("should get a member by its name", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            expect(firstChild.getMember("member2")!.getText()).to.equal("member2");
        });

        it("should get a member by a function", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            expect(firstChild.getMember(m => m.getName() === "member2")!.getText()).to.equal("member2");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getMemberOrThrow), () => {
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

    describe(nameof<EnumDeclaration>(d => d.getMembers), () => {
        it("should get all the members not including comments", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {\nmember1 = 1,\nmember2\n//a\n}");
            const members = firstChild.getMembers();
            expect(members.length).to.equal(2);
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getMembersWithComments), () => {
        it("should get all the members including comments", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {\nmember1 = 1,\nmember2\n//a\n}");
            const members = firstChild.getMembersWithComments().map(m => m.getText());
            expect(members).to.deep.equal([
                "member1 = 1",
                "member2",
                "//a"
            ]);
        });
    });

    describe(nameof<EnumDeclaration>(d => d.insertMembers), () => {
        function doTest(startCode: string, index: number, structures: EnumMemberStructure[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
            const result = firstChild.insertMembers(index, structures);
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

        it("should insert in the middle", () => {
            doTest("enum MyEnum {\n    member1,\n    member3\n}\n", 1, [{ name: "member2" }],
                "enum MyEnum {\n    member1,\n    member2,\n    member3\n}\n");
        });

        it("should insert multiple", () => {
            doTest("enum MyEnum {\n}\n", 0, [{ name: "member1" }, { name: "member2", value: 2, docs: [{ description: "description" }] }, { name: "member3" }],
                "enum MyEnum {\n    member1,\n    /**\n     * description\n     */\n    member2 = 2,\n    member3\n}\n");
        });

        it("should insert for all the structure's properties", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<EnumMemberStructure>> = {
                docs: [{ description: "testing" }],
                initializer: "5",
                value: 5,
                name: "member"
            };
            doTest("enum MyEnum {\n}\n", 0, [structure],
                "enum MyEnum {\n    /**\n     * testing\n     */\n    member = 5\n}\n");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.insertMember), () => {
        function doTest(startCode: string, index: number, structure: EnumMemberStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
            const result = firstChild.insertMember(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(EnumMember);
        }

        it("should insert a member", () => {
            doTest("enum MyEnum {\n    member2\n}\n", 0, { name: "member1" }, "enum MyEnum {\n    member1,\n    member2\n}\n");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.addMember), () => {
        function doTest(startCode: string, structure: EnumMemberStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
            const result = firstChild.addMember(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(EnumMember);
        }

        it("should add a member", () => {
            doTest("enum MyEnum {\n    member1\n}\n", { name: "member2" }, "enum MyEnum {\n    member1,\n    member2\n}\n");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.addMembers), () => {
        function doTest(startCode: string, structures: EnumMemberStructure[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startCode);
            const result = firstChild.addMembers(structures);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add members", () => {
            doTest("enum MyEnum {\n    member1\n}\n", [{ name: "member2" }, { name: "member3" }], "enum MyEnum {\n    member1,\n    member2,\n    member3\n}\n");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.isConstEnum), () => {
        it("should have a const keyword when it has one", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            expect(firstChild.isConstEnum()).is.true;
        });

        it("should not have a const keyword when it doesn't have one", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(firstChild.isConstEnum()).is.false;
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getConstKeyword), () => {
        it("should get a const keyword when it has one", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            expect(firstChild.getConstKeyword()!.getText()).to.equal("const");
        });

        it("should not get a const keyword when it doesn't have one", () => {
            const { firstChild } = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(firstChild.getConstKeyword()).is.undefined;
        });
    });

    describe(nameof<EnumDeclaration>(d => d.setIsConstEnum), () => {
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
    });

    describe(nameof<EnumDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: OptionalKindAndTrivia<EnumDeclarationSpecificStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<EnumDeclaration>(startingCode);
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
                    name: "member"
                }]
            };
            doTest("enum Identifier {\n    m\n}", structure, "const enum Identifier {\n    member\n}");
        });

        it("should remove existing members when specifying an empty array", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<EnumDeclarationSpecificStructure>> = {
                isConst: true,
                members: []
            };
            doTest("enum Identifier {\n    m\n}", structure, "const enum Identifier {\n}");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getEnums()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the enum declaration", () => {
            doTest("enum I {}\n\nenum J {}\n\nenum K {}", 1, "enum I {}\n\nenum K {}");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getStructure), () => {
        function doTest(code: string, expected: OptionalTrivia<MakeRequired<EnumDeclarationStructure>>) {
            const { firstChild } = getInfoFromText<EnumDeclaration>(code);
            const structure = firstChild.getStructure();
            structure.members = structure.members!.map(m => ({ name: m.name }));
            expect(structure).to.deep.equal(expected);
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
                members: []
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
                members: [{ name: "member" }]
            });
        });
    });
});
