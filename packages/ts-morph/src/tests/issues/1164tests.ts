import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #1164", () => {
    it("should not forget the source file when using `getSymbol()` after it creates a source file", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("index.ts", "");
        const i = sourceFile.addInterface({ name: "Foo" }).getType();

        expect(project.getSourceFiles().length).to.equal(1);
        sourceFile.addInterface({ name: "FooBar" });
        i.getSymbol();
        expect(project.getSourceFiles().length).to.equal(1); // was 0 before this was fixed
    });
});
