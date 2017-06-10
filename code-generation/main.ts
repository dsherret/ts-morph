import * as path from "path";
import * as fs from "fs";
import TsSimpleAst from "./../src/main";
import {getClassViewModels} from "./getClassViewModels";
import {createFillNodeFromMixinStructuresFunctions} from "./createFillNodeFromMixinStructuresFunctions";
import {getFillOnlyFunctionViewModels} from "./getFillOnlyFunctionViewModels";

const rootFolder = path.join(__dirname, "../../"); // two because this script is generated into a dist folder

const ast = new TsSimpleAst({ tsConfigFilePath: path.join(rootFolder, "tsconfig.json") });
ast.addSourceFiles(path.join(rootFolder, "src/**/*{.d.ts,.ts}"));
const classVMs = Array.from(getClassViewModels(ast));
const fillOnlyFunctionVMs = getFillOnlyFunctionViewModels(ast);
const code = createFillNodeFromMixinStructuresFunctions({
    classVMs,
    fillOnlyFunctionVMs
});
fs.writeFileSync(path.join(rootFolder, "src/manipulation/fillClassFunctions.ts"), code, { encoding: "utf-8" });
