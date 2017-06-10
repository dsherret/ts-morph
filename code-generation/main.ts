import * as path from "path";
import * as fs from "fs";
import TsSimpleAst from "./../src/main";
import {rootFolder} from "./config";
import {getAst, getClassViewModels, getFillOnlyFunctionViewModels} from "./common";
import {createFillNodeFromMixinStructuresFunctions} from "./createFillNodeFromMixinStructuresFunctions";

const ast = getAst();
const classVMs = Array.from(getClassViewModels(ast));
const fillOnlyFunctionVMs = getFillOnlyFunctionViewModels(ast);
const code = createFillNodeFromMixinStructuresFunctions({
    classVMs,
    fillOnlyFunctionVMs
});
fs.writeFileSync(path.join(rootFolder, "src/manipulation/fillClassFunctions.ts"), code, { encoding: "utf-8" });
