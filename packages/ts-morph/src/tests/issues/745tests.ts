import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #45", () => {
    it("should not error when adding a constructor and the class only has an empty comment in the body", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/MyClass.ts", `class Foo {
//
}`);
        const classDec = sourceFile.getClasses()[0];
        classDec.addConstructor({
            statements: "console.log('test');"
        });

        expect(sourceFile.getFullText()).to.equal("class Foo {\n//\n\n    constructor() {\n        console.log('test');\n    }\n}");
    });

    it("should not error when there is a comment on the close brace token", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/MyClass.ts", `class Foo {
//
/*b*/}`);
        const classDec = sourceFile.getClasses()[0];
        classDec.insertConstructor(1, {
            statements: "console.log('test');"
        });

        expect(sourceFile.getFullText()).to.equal("class Foo {\n//\n\n    constructor() {\n        console.log('test');\n    }\n\n/*b*/}");
    });
});
