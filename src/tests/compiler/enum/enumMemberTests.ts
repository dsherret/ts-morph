import { expect } from "chai";
import { EnumDeclaration, EnumMember } from "../../../compiler";
import { EnumMemberSpecificStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

function getInfoFromTextWithFirstMember(text: string) {
    const obj = getInfoFromText<EnumDeclaration>(text);
    const firstEnumMember = obj.firstChild.getMembers()[0];
    return { ...obj, firstEnumMember };
}

describe(nameof(EnumMember), () => {
    describe(nameof<EnumMember>(d => d.getValue), () => {
        describe("number enum", () => {
            const {firstChild} = getInfoFromTextWithFirstMember("enum MyEnum {myMember1=4,myMember2}");
            const members = firstChild.getMembers();

            it("should get the correct value for members with an initializer", () => {
                expect(members[0].getValue()).to.equal(4);
            });

            it("should get the correct value for members without an initializer", () => {
                expect(members[1].getValue()).to.equal(5);
            });
        });

        describe("string enum", () => {
            const {firstEnumMember} = getInfoFromTextWithFirstMember("enum MyEnum {member = 'str'}");

            it("should get the correct value for member", () => {
                expect(firstEnumMember.getValue()).to.equal("str");
            });
        });
    });

    describe(nameof<EnumMember>(d => d.setValue), () => {
        function doTest(text: string, value: string | number, expected: string) {
            const {firstChild, firstEnumMember} = getInfoFromTextWithFirstMember(text);
            firstEnumMember.setValue(value);
            expect(firstChild.getText()).to.equal(expected);
        }

        it("should set the value to a string", () => {
            doTest("enum MyEnum { member }", "str", `enum MyEnum { member = "str" }`);
        });

        it("should escape a string with a quote in it", () => {
            doTest("enum MyEnum { member }", "st\"r", `enum MyEnum { member = "st\\"r" }`);
        });

        it("should escape a string with a newline in it", () => {
            doTest("enum MyEnum { member }", "st\nr", `enum MyEnum { member = "st\\\nr" }`);
        });

        it("should set the value for to a number", () => {
            doTest("enum MyEnum { member }", 5, `enum MyEnum { member = 5 }`);
        });
    });

    describe(nameof<EnumMember>(d => d.remove), () => {
        it("should remove the member and its comma when its the only member", () => {
            const {firstEnumMember, firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member,\n}\n");
            firstEnumMember.remove();
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n}\n");
        });

        it("should remove the member and its comma when it's the first member", () => {
            const {firstEnumMember, firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member1 = 2,\n  member2\n}\n");
            firstEnumMember.remove();
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n  member2\n}\n");
        });

        it("should remove the member when it's the last member", () => {
            const {firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member1 = 2,\n  member2\n}\n");
            firstChild.getMembers()[1].remove();
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n  member1 = 2,\n}\n");
        });

        it("should remove the member when it's in the middle", () => {
            const {firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member1 = 2,\n  member2,\n  member3\n}\n");
            firstChild.getMembers()[1].remove();
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n  member1 = 2,\n  member3\n}\n");
        });
    });

    describe(nameof<EnumMember>(d => d.fill), () => {
        function doTest(code: string, structure: Partial<EnumMemberSpecificStructure>, expectedCode: string) {
            const {firstEnumMember, sourceFile} = getInfoFromTextWithFirstMember(code);
            firstEnumMember.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change anything when nothing was specified", () => {
            doTest("enum Identifier { member }", {}, "enum Identifier { member }");
        });

        it("should change when specifying", () => {
            const structure: MakeRequired<EnumMemberSpecificStructure> = {
                value: 5
            };
            doTest("enum Identifier { member }", structure, "enum Identifier { member = 5 }");
        });
    });
});
