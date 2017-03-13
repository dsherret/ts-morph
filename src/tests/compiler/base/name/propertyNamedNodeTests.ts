import {expect} from "chai";
import {EnumDeclaration, PropertyNamedNode, Identifier} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithFirstMember(text = "enum MyEnum { myMember }") {
    const obj = getInfoFromText<EnumDeclaration>(text);
    const firstEnumMember = obj.firstChild.getMembers()[0];
    return { ...obj, firstEnumMember };
}

describe(nameof(PropertyNamedNode), () => {
    describe(nameof<PropertyNamedNode>(n => n.setName), () => {
        function throwTest(text: any) {
            const {firstEnumMember} = getInfoFromTextWithFirstMember();
            expect(() => firstEnumMember.setName(text)).to.throw();
        }

        it("should set the name and rename any referenced nodes", () => {
            const {firstEnumMember, sourceFile} = getInfoFromTextWithFirstMember("enum MyEnum { myMember }\nlet myEnumMember = MyEnum.myMember;");
            firstEnumMember.setName("myNewMember");
            expect(sourceFile.getFullText()).to.equal("enum MyEnum { myNewMember }\nlet myEnumMember = MyEnum.myNewMember;");
        });

        it("should throw if null", () => {
            throwTest(null);
        });

        it("should throw if empty string", () => {
            throwTest("");
        });

        it("should throw if whitespace", () => {
            throwTest("    ");
        });

        it("should throw if a number", () => {
            throwTest(4);
        });
    });

    describe(nameof<PropertyNamedNode>(n => n.getName), () => {
        const {firstEnumMember} = getInfoFromTextWithFirstMember();

        it("should get the name", () => {
            expect(firstEnumMember.getName()).to.equal("myMember");
        });
    });

    describe(nameof<PropertyNamedNode>(n => n.getNameNode), () => {
        const {firstEnumMember} = getInfoFromTextWithFirstMember();
        const nameNode = firstEnumMember.getNameNode();

        it("should have correct text", () => {
            expect(nameNode.getText()).to.equal("myMember");
        });

        it("should be of correct instance", () => {
            expect(nameNode).to.be.instanceOf(Identifier);
        });
    });
});
