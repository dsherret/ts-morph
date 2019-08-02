import { expect } from "chai";
import { ComputedPropertyName, InterfaceDeclaration } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

function getInfoFromTextWithFirstInterfaceProperty(text: string) {
    const obj = getInfoFromText<InterfaceDeclaration>(text);
    const firstProp = obj.firstChild.getProperties()[0];
    return { ...obj, firstProp };
}

describe(nameof(ComputedPropertyName), () => {
    describe(nameof<ComputedPropertyName>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const { firstProp } = getInfoFromTextWithFirstInterfaceProperty(text);
            const computedPropertyName = (firstProp.getNameNode() as ComputedPropertyName);
            expect(computedPropertyName.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("interface MyInterface { [5]: string; }", "5");
        });
    });
});
