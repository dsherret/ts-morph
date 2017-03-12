import {expect} from "chai";
import {TsEnumDeclaration, TsEnumMemberDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithFirstMember(text: string) {
    const obj = getInfoFromText<TsEnumDeclaration>(text);
    const tsFirstEnumMember = obj.tsFirstChild.getMembers()[0];
    return { ...obj, tsFirstEnumMember };
}

describe(nameof(TsEnumMemberDeclaration), () => {
    describe(nameof<TsEnumMemberDeclaration>(d => d.endsWithComma), () => {
        function endsWithCommaTest(text: string, expected: boolean) {
            const {tsFirstEnumMember} = getInfoFromTextWithFirstMember(text);
            expect(tsFirstEnumMember.endsWithComma()).to.equal(expected);
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
