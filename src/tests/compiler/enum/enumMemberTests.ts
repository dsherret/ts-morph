import {expect} from "chai";
import {EnumDeclaration, EnumMember} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithFirstMember(text: string) {
    const obj = getInfoFromText<EnumDeclaration>(text);
    const firstEnumMember = obj.firstChild.getMembers()[0];
    return { ...obj, firstEnumMember };
}

describe(nameof(EnumMember), () => {
    describe(nameof<EnumMember>(d => d.getValue), () => {
        const {firstChild} = getInfoFromTextWithFirstMember("enum MyEnum {myMember1=4,myMember2}");
        const members = firstChild.getMembers();

        it("should get the correct value for members with an initializer", () => {
            expect(members[0].getValue()).to.equal(4);
        });

        it("should get the correct value for members without an initializer", () => {
            expect(members[1].getValue()).to.equal(5);
        });
    });

    describe(nameof<EnumMember>(d => d.endsWithComma), () => {
        function endsWithCommaTest(text: string, expected: boolean) {
            const {firstEnumMember} = getInfoFromTextWithFirstMember(text);
            expect(firstEnumMember.endsWithComma()).to.equal(expected);
        }

        it("should not end with a comma when not ends with one", () => {
            endsWithCommaTest("enum MyEnum { member\n}\n", false);
        });

        it("should not end with a comma when not ends with one and has expression", () => {
            endsWithCommaTest("enum MyEnum { member = 1\n}\n", false);
        });

        it("should end with a comma when ends with one", () => {
            endsWithCommaTest("enum MyEnum { member, \n}\n", true);
        });

        it("should end with a comma when ends with one and has expression", () => {
            endsWithCommaTest("enum MyEnum { member = 1, \n}\n", true);
        });
    });

    describe(nameof<EnumMember>(d => d.getFollowingComma), () => {
        it("should not get comma when not ends with one", () => {
            const {firstEnumMember} = getInfoFromTextWithFirstMember("enum MyEnum { member\n}\n");
            expect(firstEnumMember.getFollowingComma()).to.be.undefined;
        });

        it("should get comma when ends with one", () => {
            const {firstEnumMember} = getInfoFromTextWithFirstMember("enum MyEnum { member,\n}\n");
            expect(firstEnumMember.getFollowingComma()!.getText()).to.equal(",");
        });

        it("should get comma when ends with one and has initializer", () => {
            const {firstEnumMember} = getInfoFromTextWithFirstMember("enum MyEnum { member = 4,\n}\n");
            expect(firstEnumMember.getFollowingComma()!.getText()).to.equal(",");
        });
    });

    describe(nameof<EnumMember>(d => d.remove), () => {
        it("should remove the member and its comma when its the only member", () => {
            const {firstEnumMember, firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member,\n}\n");
            expect(firstEnumMember.remove()).to.equal(firstChild);
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n}\n");
        });

        it("should remove the member and its comma when it's the first member", () => {
            const {firstEnumMember, firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member1 = 2,\n  member2\n}\n");
            expect(firstEnumMember.remove()).to.equal(firstChild);
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n  member2\n}\n");
        });

        it("should remove the member when it's the last member", () => {
            const {firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member1 = 2,\n  member2\n}\n");
            expect(firstChild.getMembers()[1].remove()).to.equal(firstChild);
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n  member1 = 2,\n}\n");
        });

        it("should remove the member when it's in the middle", () => {
            const {firstChild, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum {\n  member1 = 2,\n  member2,\n  member3\n}\n");
            expect(firstChild.getMembers()[1].remove()).to.equal(firstChild);
            expect(sourceFile.getText()).to.equal("enum MyEnum {\n  member1 = 2,\n  member3\n}\n");
        });
    });
});
