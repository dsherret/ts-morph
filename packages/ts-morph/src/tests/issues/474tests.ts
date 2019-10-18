import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #474", () => {
    it("should not error when organizing imports", () => {
        const { sourceFile } = getInfoFromText("class MyClass {\n}");
        const classDec = sourceFile.getClassOrThrow("MyClass");

        classDec.addProperties([{
            name: "prop1"
        }, {
            leadingTrivia: writer => writer.newLine(),
            name: "prop2"
        }]);

        expect(classDec.getText()).to.equal(`class MyClass {
    prop1;

    prop2;
}`);
    });
});
