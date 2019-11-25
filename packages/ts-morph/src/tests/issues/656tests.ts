import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #656", () => {
    it("should not error if emitting a markdown file", () => {
        // people should not be doing this, but it should just skip emitting if this happens
        const project = new Project({ useInMemoryFileSystem: true });
        const file = project.createSourceFile("test.md", "# Header");
        const result = file.getEmitOutput();
        expect(result.getEmitSkipped()).to.be.true;
        expect(result.getOutputFiles().length).to.equal(0);
    });
});
