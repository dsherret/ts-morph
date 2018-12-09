import { expect } from "chai";
import { PropertyAccessExpression } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(PropertyAccessExpression), () => {
    function getPropertyAccessExpression(text: string) {
        const { sourceFile } = getInfoFromText(text);
        return sourceFile.getVariableDeclarations()[0].getInitializerOrThrow() as PropertyAccessExpression;
    }

    it("should get the property access expression when only one dot", () => {
        const propertyAccessExpression = getPropertyAccessExpression("const t = M.N;");
        expect(propertyAccessExpression.getExpression().getText()).to.equal("M");
        expect(propertyAccessExpression.getNameNode().getText()).to.equal("N");
    });

    it("should get the nested property access expression when two dots", () => {
        const propertyAccessExpression = getPropertyAccessExpression("const t = M.N.O;");
        const nestedExpression = propertyAccessExpression.getExpression() as PropertyAccessExpression;
        expect(nestedExpression.getText()).to.equal("M.N");
        expect(nestedExpression.getExpression().getText()).to.equal("M");
        expect(nestedExpression.getName()).to.equal("N");
        expect(propertyAccessExpression.getNameNode().getText()).to.equal("O");
    });
});
