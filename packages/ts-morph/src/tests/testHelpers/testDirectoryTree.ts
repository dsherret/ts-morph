import { expect } from "chai";
import { SourceFile } from "../../compiler";
import { Directory } from "../../fileSystem";

export interface TreeNode {
    directory: Directory;
    sourceFiles?: SourceFile[];
    children?: TreeNode[];
}

export function testDirectoryTree(dir: Directory, tree: TreeNode, parent?: Directory) {
    expect(getDirPath(dir)).to.equal(getDirPath(tree.directory), "dir");
    expect(getDirPath(!dir._hasLoadedParent() ? undefined : dir.getParent())).to.equal(getDirPath(parent), `parent dir of ${getDirPath(dir)}`);
    expect(dir.getDirectories().map(d => d.getPath())).to.deep.equal((tree.children || []).map(c => c.directory.getPath()), "child directories");
    expect(dir.getSourceFiles().map(s => s.getFilePath())).to.deep.equal((tree.sourceFiles || []).map(s => s.getFilePath()), "source files");
    for (const child of (tree.children || []))
        testDirectoryTree(child.directory, child, dir);

    function getDirPath(directory: Directory | undefined) {
        return directory?.getPath();
    }
}
