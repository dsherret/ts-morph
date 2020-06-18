import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #817", () => {
    it("should add a tag when the description is just a slash n", () => {
        const { sourceFile } = getInfoFromText(`
class MyClass {
}`);
        const classDec = sourceFile.getClassOrThrow("MyClass");
        const jsDoc = classDec.addJsDoc({ description: "\n" });
        jsDoc.addTag({ tagName: "myTag", text: "my text" });
        expect(sourceFile.getFullText()).to.equal(`
/**
 * @myTag my text
 */
class MyClass {
}`);
    });
});
