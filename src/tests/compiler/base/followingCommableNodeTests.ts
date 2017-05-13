import {expect} from "chai";
import {EnumDeclaration, EnumMember, FollowingCommableNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithFirstMember(text: string) {
    const obj = getInfoFromText<EnumDeclaration>(text);
    const firstEnumMember = obj.firstChild.getMembers()[0];
    return { ...obj, firstEnumMember };
}

describe(nameof(FollowingCommableNode), () => {
    describe(nameof<FollowingCommableNode>(d => d.hasFollowingComma), () => {
        function hasFollowingCommaTest(text: string, expected: boolean) {
            const {firstEnumMember} = getInfoFromTextWithFirstMember(text);
            expect(firstEnumMember.hasFollowingComma()).to.equal(expected);
        }

        it("should not end with a comma when not ends with one", () => {
            hasFollowingCommaTest("enum MyEnum { member\n}\n", false);
        });

        it("should not end with a comma when not ends with one and has expression", () => {
            hasFollowingCommaTest("enum MyEnum { member = 1\n}\n", false);
        });

        it("should end with a comma when ends with one", () => {
            hasFollowingCommaTest("enum MyEnum { member, \n}\n", true);
        });

        it("should end with a comma when ends with one and has expression", () => {
            hasFollowingCommaTest("enum MyEnum { member = 1, \n}\n", true);
        });
    });

    describe(nameof<FollowingCommableNode>(d => d.getFollowingComma), () => {
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
});
