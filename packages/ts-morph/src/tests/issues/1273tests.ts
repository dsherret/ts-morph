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

    // the `*` and the file's end-of-file token are annotated too, which they were
    // not before: tsgo's visitEachChild hands token children to the same visitor as
    // every other child, where the `typescript` package reserved them for a separate
    // token visitor and so skipped them. Printing the end-of-file token is what puts
    // the last comment after the semicolon, and what takes the place of the newline
    // that would otherwise end the file.
    expect(file.getFullText()).to.equal(`const /*A*/ x: /*A*/ number = /*A*/ 5 /*A*/ * /*A*/ 9;/*A*/ `);
  });
});
