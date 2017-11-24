import * as ts from "typescript";
import {expect} from "chai";
import {ObjectLiteralExpression} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(ObjectLiteralExpression), () => {
    function getObjectLiteralExpression(text: string) {
        const opts = getInfoFromText(text);
        const objectLiteralExpression = opts.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression) as ObjectLiteralExpression;
        return {
            objectLiteralExpression,
            ...opts
        };
    }

    describe(nameof<ObjectLiteralExpression>(e => e.getProperties), () => {
        function doTest(text: string, props: string[]) {
            const {objectLiteralExpression} = getObjectLiteralExpression(text);
            expect(objectLiteralExpression.getProperties().map(p => p.getText())).to.deep.equal(props);
        }

        it("should get the properties from the object literal expression", () => {
            doTest("const t = { prop: 5, prop2: 8, prop3 };", ["prop: 5", "prop2: 8", "prop3"]);
        });
    });
});
