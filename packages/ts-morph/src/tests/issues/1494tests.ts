import { ts } from "@ts-morph/common";
import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for my issue", () => {
  it("should update specifiers with path aliases during move", () => {
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        baseUrl: '.',
        paths: {
          'Root/*': ['./*']
        }
      }
    });

    const fileAtRoot = project.createSourceFile("a.ts", `export function foo() {}`);
    const fileAtNestedFolder = project.createSourceFile("nested/deep/a.ts", `export function nested() {}`);

    const relImportRoot = project.createSourceFile("b.ts", `import { foo } from "./a";`);
    const relImportFolder = project.createSourceFile("/b/b.ts", `import { foo } from "../a";`);

    const aliasImport = project.createSourceFile("c.ts", `import { foo } from "Root/a";`);
    const aliasExport = project.createSourceFile("d.ts", `export { foo } from "Root/a";`);
    const aliasImportFolder = project.createSourceFile("/c/c.ts", `import { foo } from "Root/a";`);
    const aliasToNestedFolder = project.createSourceFile("/d/d.ts", `import { nested } from "Root/nested/deep/a";`);


    const dir = project.createDirectory('./a');
    const deepDir = project.createDirectory('./nested/deep/deeper');
    fileAtRoot.moveToDirectory(dir)
    fileAtNestedFolder.moveToDirectory(deepDir)

    expect(relImportRoot.getFullText()).to.equal(`import { foo } from "./a/a";`);
    expect(relImportFolder.getFullText()).to.equal(`import { foo } from "../a/a";`);

    expect(aliasImport.getFullText()).to.equal(`import { foo } from "Root/a/a";`);
    expect(aliasImportFolder.getFullText()).to.equal(`import { foo } from "Root/a/a";`);
    expect(aliasToNestedFolder.getFullText()).to.equal(`import { nested } from "Root/nested/deep/deeper/a";`);
    expect(aliasExport.getFullText()).to.equal(`export { foo } from "Root/a/a";`);
  });
});
