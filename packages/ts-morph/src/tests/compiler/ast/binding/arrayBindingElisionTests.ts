import { expect } from "chai";
import { Project } from "../../../../Project";

// tsgo parses the hole in `const [, a] = x` as a BindingElement with no name,
// where the `typescript` package produced an OmittedExpression. Anything that
// walks binding pattern elements looking for a name has to expect that.
describe("array binding pattern elisions", () => {
  it("should find a variable declared after an elision", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sf = project.createSourceFile("/a.ts", "const [, a] = [1, 2];");
    expect(sf.getVariableDeclarationOrThrow("a").getName()).to.equal("[, a]");
    expect(sf.getVariableDeclaration("nope")).to.be.undefined;
  });

  it("should not throw looking through a parameter binding with an elision", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sf = project.createSourceFile("/b.ts", "function f([, b]: number[]) { return b; }");
    expect(sf.getFunctionOrThrow("f").getParameters().length).to.equal(1);
    expect(sf.getVariableDeclaration("nope")).to.be.undefined;
  });
});
