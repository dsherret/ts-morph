import { expect } from "chai";
import { ClassDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #328", () => {
    it("should not add a statement and indent the braces", () => {
        const text = `
class MyClass {
    myMethod() {
    }
}`;
        const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
        firstChild.getMethodOrThrow("myMethod").addStatements("let k = () => { return true; }");

        // cannot reproduce: works fine in this scenario
        expect(sourceFile.getFullText()).to.equal(`
class MyClass {
    myMethod() {
        let k = () => { return true; }
    }
}`);
    });
});
