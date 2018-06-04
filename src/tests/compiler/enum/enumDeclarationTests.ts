import { expect } from "chai";
import { EnumDeclaration, EnumMember } from "../../../compiler";
import { EnumDeclarationSpecificStructure, EnumMemberStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(EnumDeclaration), () => {
    describe(nameof<EnumDeclaration>(d => d.getMember), () => {
        it("should get a member by its name", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            expect(firstChild.getMember("member2")!.getText()).to.equal("member2");
        });

        it("should get a member by a function", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            expect(firstChild.getMember(m => m.getName() === "member2")!.getText()).to.equal("member2");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getMemberOrThrow), () => {
        it("should get a member by its name", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            expect(firstChild.getMemberOrThrow("member2").getText()).to.equal("member2");
        });

        it("should get a member by a function", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            expect(firstChild.getMemberOrThrow(m => m.getName() === "member2").getText()).to.equal("member2");
        });

        it("should get a member by a function", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1, member2 }");
            expect(() => firstChild.getMemberOrThrow(m => m.getName() === "member9")).to.throw();
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getMembers), () => {
        it("should get all the members", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member1 = 1, member2 }");
            const members = firstChild.getMembers();
            expect(members.length).to.equal(2);
        });
    });

    describe(nameof<EnumDeclaration>(d => d.insertMembers), () => {
        function doTest(startCode: string, index: number, structures: EnumMemberStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>(startCode);
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
            const structure: MakeRequired<EnumMemberStructure> = {
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
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>(startCode);
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
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>(startCode);
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
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>(startCode);
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
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            expect(firstChild.isConstEnum()).is.true;
        });

        it("should not have a const keyword when it doesn't have one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(firstChild.isConstEnum()).is.false;
        });
    });

    describe(nameof<EnumDeclaration>(d => d.getConstKeyword), () => {
        it("should get a const keyword when it has one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            expect(firstChild.getConstKeyword()!.getText()).to.equal("const");
        });

        it("should not get a const keyword when it doesn't have one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(firstChild.getConstKeyword()).is.undefined;
        });
    });

    describe(nameof<EnumDeclaration>(d => d.setIsConstEnum), () => {
        it("should set as const enum when not one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            firstChild.setIsConstEnum(true);
            expect(firstChild.getText()).to.equal("const enum MyEnum {}");
        });

        it("should set as not const enum when is one", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            firstChild.setIsConstEnum(false);
            expect(firstChild.getText()).to.equal("enum MyEnum {}");
        });

        it("should stay the same if setting to same value", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("const enum MyEnum {}");
            firstChild.setIsConstEnum(true);
            expect(firstChild.getText()).to.equal("const enum MyEnum {}");
        });
    });

    describe(nameof<EnumDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: EnumDeclarationSpecificStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("enum Identifier {\n}", {}, "enum Identifier {\n}");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<EnumDeclarationSpecificStructure> = {
                isConst: true,
                members: [{
                    name: "member"
                }]
            };
            doTest("enum Identifier {\n}", structure, "const enum Identifier {\n    member\n}");
        });
    });

    describe(nameof<EnumDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getEnums()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the enum declaration", () => {
            doTest("enum I {}\n\nenum J {}\n\nenum K {}", 1, "enum I {}\n\nenum K {}");
        });
    });
});
