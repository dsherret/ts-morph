import { InMemoryFileSystemHost } from "@ts-morph/common";
import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #1227", () => {
  it("should find referencing source files", () => {
    const fileSystem = new InMemoryFileSystemHost();
    fileSystem.writeFileSync(
      "/server.ts",
      `import { run } from './mid'`,
    );
    fileSystem.writeFileSync(
      "/mid.ts",
      `import {A, B} from './constants';

export function run() {
  console.log(A, B);
  return null as any;
}
`,
    );
    fileSystem.writeFileSync(
      "/constants.ts",
      `export const A = 'a';
export const B = 'b';
`,
    );
    fileSystem.writeFileSync(
      "/tsconfig.json",
      `{
  "exclude": [
    "node_modules"
  ],
  "compilerOptions": {
    "module": "commonjs",
    "target": "es6",
    "outDir": "./dist",
    "baseUrl": ".",
  },
  "files": [
    "./server.ts",
  ]
}`,
    );
    const project = new Project({ fileSystem, tsConfigFilePath: "/tsconfig.json" });

    const file = project.getSourceFileOrThrow("constants.ts");
    expect(file.getReferencingNodesInOtherSourceFiles().map(n => n.getText()))
      .to.deep.equal(["import {A, B} from './constants';"]);
  });
});
