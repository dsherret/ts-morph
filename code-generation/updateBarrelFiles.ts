import {getAst} from "./common";
import {BarrelFileMaintainer} from "./BarrelFileMainter";

const ast = getAst();
const maintainer = new BarrelFileMaintainer(ast);

for (const rootDir of ast.getRootDirectories()) {
    // no need to create a barrel file in the root directory
    for (const dir of rootDir.getDirectories())
        maintainer.updateDirAndSubDirs(dir);
}

ast.saveUnsavedSourceFiles();
