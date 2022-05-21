import { ts } from "@ts-morph/common";
import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #1273", () => {
  it("should output synthetic comments on nodes with only addSyntheticLeadingComment", () => {
    const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { removeComments: false } });

    const file = project.createSourceFile("x.ts", `const x: number = 5 * 9;`);
    file.transform(traversal => {
      const node = traversal.visitChildren();
      if (node.getChildCount() === 0)
        return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, "A", false);
      return node;
    });

    expect(file.getFullText()).to.equal(`const /*A*/ x: /*A*/ number = /*A*/ 5 * /*A*/ 9;\n`);
  });
});
