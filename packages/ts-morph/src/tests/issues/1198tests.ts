import { expect } from "chai";
import { Project } from "../../Project";

describe.only("tests for issue #1198", () => {
    it("should not have issues when renaming private identifier", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("mod.ts", `class Foo {
  private one: string;
  private two: string;
}`);
        const classDecl = sourceFile.getClasses()[0];
        for (const property of classDecl.getInstanceProperties()) {
            const name = property.getName();
            property.toggleModifier("private", false);
            property.rename(`#${name}`);
        }

        expect(sourceFile.getText()).to.equal(`class Foo {
  #one: string;
  #two: string;
}`);

        // now swap them back
        for (const property of classDecl.getInstanceProperties()) {
            const name = property.getName().replace(/^#/, "");
            property.rename(`${name}`);
            property.toggleModifier("private", true);
        }

        expect(sourceFile.getText()).to.equal(`class Foo {
  private one: string;
  private two: string;
}`);
    });
});
