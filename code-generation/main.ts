import * as path from "path";
import * as fs from "fs";
import TsSimpleAst from "./../src/main";
import {rootFolder, isOverloadStructure} from "./config";
import {getAst, getClassViewModels, getStructureViewModels, getFillOnlyFunctionViewModels} from "./common";
import {createFillNodeFromMixinStructuresFunctions} from "./createFillNodeFromMixinStructuresFunctions";

const ast = getAst();
const classVMs = Array.from(getClassViewModels(ast));
const fillOnlyFunctionVMs = getFillOnlyFunctionViewModels(ast);
const overloadStructureVMs = Array.from(getStructureViewModels(ast)).filter(s => isOverloadStructure(s));
const code = createFillNodeFromMixinStructuresFunctions({
    classVMs,
    fillOnlyFunctionVMs,
    overloadStructureVMs
});
fs.writeFileSync(path.join(rootFolder, "src/manipulation/fillClassFunctions.ts"), code, { encoding: "utf-8" });
