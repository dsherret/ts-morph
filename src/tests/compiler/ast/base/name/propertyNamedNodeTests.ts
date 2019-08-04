import { expect } from "chai";
import { ComputedPropertyName, Identifier, InterfaceDeclaration, NumericLiteral, PropertyNamedNode, StringLiteral } from "../../../../../compiler";
import { getInfoFromText } from "../../../testHelpers";

function getInfoFromTextWithFirstInterfaceProperty(text: string) {
    const obj = getInfoFromText<InterfaceDeclaration>(text);
    const firstProp = obj.firstChild.getProperties()[0];
    return { ...obj, firstProp };
}

describe(nameof(PropertyNamedNode), () => {
    describe(nameof<PropertyNamedNode>(n => n.rename), () => {
        function renameTest(startText: string, newName: string, expectedText: string) {
            const { firstProp, sourceFile, project } = getInfoFromTextWithFirstInterfaceProperty(startText);
            firstProp.rename(newName);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set the name and rename any referenced nodes", () => {
            renameTest("interface Identifier { prop: string; }\nlet myVar: Identifier;\nmyVar.prop;", "newProp",
                "interface Identifier { newProp: string; }\nlet myVar: Identifier;\nmyVar.newProp;");
        });

        it("should rename to a string literal", () => {
            // this actually won't do too good of a job because the compiler currently doesn't support this scenario
            renameTest("interface Identifier { prop: string; }\nlet myVar: Identifier;\nmyVar.prop; console.log('this');", "'str'",
                "interface Identifier { 'str': string; }\nlet myVar: Identifier;\nmyVar.'str'; console.log('this');");
        });

        function throwTest(text: any) {
            const { firstProp } = getInfoFromTextWithFirstInterfaceProperty("interface MyInterface { prop: string; }");
            expect(() => firstProp.rename(text)).to.throw();
        }

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
        function doTest(sourceFileText: string, expectedName: string) {
            const { firstProp } = getInfoFromTextWithFirstInterfaceProperty(sourceFileText);
            expect(firstProp.getName()).to.equal(expectedName);
        }

        it("should get the name when regularly named", () => {
            doTest("interface identifier { prop: string; }", "prop");
        });

        it("should get the name when a string literal", () => {
            doTest("interface identifier { 'str': string; }", "'str'");
        });

        it("should get the name when a numeric literal", () => {
            doTest("interface identifier { 5: string; }", "5");
        });

        it("should throw when getting the name of a computed property", () => {
            doTest("interface identifier { [5]: string; }", "[5]");
        });
    });

    describe(nameof<PropertyNamedNode>(n => n.getNameNode), () => {
        it("should get a regularly named node property", () => {
            const { firstProp } = getInfoFromTextWithFirstInterfaceProperty("interface identifier { prop: string; }");
            const nameNode = firstProp.getNameNode();
            expect(nameNode.getText()).to.equal("prop");
            expect(nameNode).to.be.instanceOf(Identifier);
        });

        it("should get a string literal property", () => {
            const { firstProp } = getInfoFromTextWithFirstInterfaceProperty("interface identifier { 'str': string; }");
            const nameNode = firstProp.getNameNode();
            expect(nameNode.getText()).to.equal("'str'");
            expect(nameNode).to.be.instanceOf(StringLiteral);
        });

        it("should get a numeric literal property", () => {
            const { firstProp } = getInfoFromTextWithFirstInterfaceProperty("interface identifier { 5: string; }");
            const nameNode = firstProp.getNameNode();
            expect(nameNode.getText()).to.equal("5");
            expect(nameNode).to.be.instanceOf(NumericLiteral);
        });

        it("should get a computed property name", () => {
            const { firstProp } = getInfoFromTextWithFirstInterfaceProperty("interface identifier { [5]: string; }");
            const nameNode = firstProp.getNameNode();
            expect(nameNode.getText()).to.equal("[5]");
            expect(nameNode).to.be.instanceOf(ComputedPropertyName);
        });
    });
});
