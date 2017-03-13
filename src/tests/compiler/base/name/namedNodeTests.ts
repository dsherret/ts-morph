import {expect} from "chai";
import {EnumDeclaration, NamedNode, Identifier} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(NamedNode), () => {
    describe(nameof<NamedNode>(n => n.setName), () => {
        function throwTest(text: any) {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
            expect(() => firstChild.setName(text)).to.throw;
        }

        it("should set the name and rename any referenced nodes", () => {
            const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>("enum MyEnum {}\nlet myEnum: MyEnum;");
            firstChild.setName("MyNewEnum");
            expect(sourceFile.getFullText()).to.equal("enum MyNewEnum {}\nlet myEnum: MyNewEnum;");
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

    describe(nameof<NamedNode>(n => n.getName), () => {
        const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");

        it("should get the name", () => {
            expect(firstChild.getName()).to.equal("MyEnum");
        });
    });

    describe(nameof<NamedNode>(n => n.getNameNode), () => {
        const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {}");
        const nameNode = firstChild.getNameNode();

        it("should have correct text", () => {
            expect(nameNode.getText()).to.equal("MyEnum");
        });

        it("should be of correct instance", () => {
            expect(nameNode).to.be.instanceOf(Identifier);
        });
    });
});
