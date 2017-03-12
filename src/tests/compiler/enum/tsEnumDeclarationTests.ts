import {expect} from "chai";
import {TsEnumDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TsEnumDeclaration), () => {
    describe(nameof<TsEnumDeclaration>(d => d.addMember), () => {
        it("should add a member without a value", () => {
            const {tsFirstChild, tsSourceFile} = getInfoFromText<TsEnumDeclaration>("enum MyEnum {\n}\n");
            tsFirstChild.addMember({
                name: "myName"
            });
            expect(tsSourceFile.getFullText()).to.equal("enum MyEnum {\n    myName\n}\n");
        });
    });
});
