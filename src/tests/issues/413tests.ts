import { expect } from "chai";
import { SyntaxKind } from "../../typescript";
import { Project } from "../../Project";

describe("tests for issue #413", () => {
    it("should not error when using multiple globs and addExistingSourceFile", () => {
        const project = new Project({ useVirtualFileSystem: true });
        const fs = project.getFileSystem();
        ["/dir", "/dir2"].forEach(d => fs.mkdir(d));
        fs.writeFileSync("/foo.ts", "");
        fs.writeFileSync("/dir/foo.ts", "");
        fs.writeFileSync("/dir/bar.ts", "");
        fs.writeFileSync("/dir2/foo.ts", "");
        fs.writeFileSync("/dir2/bar.ts", "");

        const sourceFiles = project.addExistingSourceFiles(["*.ts", "dir/*.ts"]);
        expect(sourceFiles.length).to.equal(3); // won't get in dir2 directory
    });
});
