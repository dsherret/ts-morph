import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #844", () => {
    it("should not throw an error getting structure", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/file.ts", `class MyClass {
            constructor(renderer: MYNAMESPACE.Renderer);
            /**
             * A flag
             * @member {boolean}
             * @readonly
             * @deprecated
             */
            readonly isActive: boolean;
        }`);

        expect(() => sourceFile.getStructure()).to.not.throw();
    });
});
