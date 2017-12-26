import * as chokidar from "chokidar";
import * as path from "path";
import {rootFolder} from "./config";
import {getAst} from "./common";
import {BarrelFileMaintainer} from "./BarrelFileMainter";
import {FileSystemRefreshResult} from "./../src/main";

const ast = getAst();

const rootDir = ast.getRootDirectories()[0]; // should only be one...
const maintainer = new BarrelFileMaintainer(rootDir);
// no need to create a barrel file in the root directory
for (const dir of rootDir.getDirectories())
    maintainer.updateDirAndSubDirs(dir);

ast.saveUnsavedSourceFiles();

chokidar.watch(path.join(rootFolder, "src/**/*.ts")).on("all", async (event: string, filePath: string) => {
    const sourceFile = ast.getSourceFile(filePath) || ast.addSourceFileIfExists(filePath);
    if (sourceFile == null)
        return;

    const directory = sourceFile.getDirectory();
    const result = await sourceFile.refreshFromFileSystem();
    switch (result) {
        case FileSystemRefreshResult.Updated:
        case FileSystemRefreshResult.Deleted:
            console.log("updated");
            maintainer.updateDirAndSubDirs(directory);
            ast.saveUnsavedSourceFiles();
            break;
    }
});
