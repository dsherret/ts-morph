import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #778", () => {
    it("should add a new member where there exists a js doc comment before at the end of the class", () => {
        const { sourceFile } = getInfoFromText(`
class Foo {
    /**
     *
     */
}`);
        const classDec = sourceFile.getClassOrThrow("Foo");
        classDec.addConstructor({});
        expect(sourceFile.getFullText()).to.equal(`
class Foo {
    /**
     *
     */
    constructor() {
    }
}`);
    });

    it("should add a new member where there exists multiple comments and js docs at the end of the class", () => {
        const { sourceFile } = getInfoFromText(`
class Foo {
    // asdf
    /** test */
    // test
    /** test */
}`);
        const classDec = sourceFile.getClassOrThrow("Foo");
        classDec.addConstructor({});
        expect(sourceFile.getFullText()).to.equal(`
class Foo {
    // asdf
    /** test */
    // test
    /** test */
    constructor() {
    }
}`);
    });

    it("should add a new source file statement where there exists multiple comments and js docs before at the end of the file", () => {
        const { sourceFile } = getInfoFromText(`
// asdf
/** test */
// test
/** test */
// test
`);
        sourceFile.addFunction({ name: "test" });
        expect(sourceFile.getFullText()).to.equal(`
// asdf
/** test */
// test
/** test */
// test
function test() {
}
`);
    });
});
