import { expect } from "chai";
import { Project } from "../../Project";
import { StructureKind } from "../../structures";

describe("tests for issue #1244", () => {
  it("write leading and trailing trivia on overloads", () => {
    const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });

    const file = project.createSourceFile("test.ts", ``);
    file.addStatements([{
      kind: StructureKind.Function,
      leadingTrivia: "// leading trivia function",
      trailingTrivia: "// trailing trivia function",
      overloads: [
        {
          leadingTrivia: "// leading trivia overload",
          trailingTrivia: "// trailing trivia overload",
          returnType: "string",
        },
      ],
      name: "functionName",
      statements: "return 'hello';",
    }, {
      kind: StructureKind.Class,
      name: "MyClass",
      methods: [{
        leadingTrivia: "// leading trivia method",
        trailingTrivia: "// trailing trivia method",
        overloads: [
          {
            leadingTrivia: "// leading trivia overload",
            trailingTrivia: "// trailing trivia overload",
            returnType: "string",
          },
        ],
        name: "method",
      }],
      ctors: [{
        leadingTrivia: "// leading trivia ctor",
        trailingTrivia: "// trailing trivia ctor",
        overloads: [
          {
            leadingTrivia: "// leading trivia overload",
            trailingTrivia: "// trailing trivia overload",
          },
        ],
      }],
    }]);

    expect(file.getFullText()).to.equal(`// leading trivia function
// leading trivia overload
function functionName(): string;// trailing trivia overload
function functionName() {
    return 'hello';
}// trailing trivia function

class MyClass {
    // leading trivia ctor
    // leading trivia overload
    constructor();// trailing trivia overload
    constructor() {
    }// trailing trivia ctor

    // leading trivia method
    // leading trivia overload
    method(): string;// trailing trivia overload
    method() {
    }// trailing trivia method
}
`);
  });
});
