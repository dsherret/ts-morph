import {expect} from "chai";
import {EnumDeclaration, EnumMemberDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithFirstMember(text: string) {
    const obj = getInfoFromText<EnumDeclaration>(text);
    const firstEnumMember = obj.firstChild.getMembers()[0];
    return { ...obj, firstEnumMember };
}

describe(nameof(EnumMemberDeclaration), () => {
    describe(nameof<EnumMemberDeclaration>(d => d.endsWithComma), () => {
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
});
