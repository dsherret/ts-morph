import * as path from "path";
import * as fs from "fs";
import TsSimpleAst from "./../src/main";
import {rootFolder, isOverloadStructure} from "./config";
import {getAst, getClassViewModels, getStructureViewModels, getFillOnlyFunctionViewModels} from "./common";
import {createFillNodeFromMixinStructuresFunctions} from "./createFillNodeFromMixinStructuresFunctions";
import {createGetStructureFunctions} from "./createGetStructureFunctions";

const ast = getAst();
const classVMs = Array.from(getClassViewModels(ast));
const fillOnlyFunctionVMs = getFillOnlyFunctionViewModels(ast);
const structureVMs = Array.from(getStructureViewModels(ast));
const overloadStructureVMs = structureVMs.filter(s => isOverloadStructure(s));

// fill node from mixin structure functions
const fillNodeFromMixinStructuresCode = createFillNodeFromMixinStructuresFunctions({
    classVMs,
    fillOnlyFunctionVMs,
    overloadStructureVMs
});
fs.writeFileSync(path.join(rootFolder, "src/manipulation/fillClassFunctions.ts"), fillNodeFromMixinStructuresCode, { encoding: "utf-8" });

// get structure functions
const getStructureCode = createGetStructureFunctions(structureVMs);
fs.writeFileSync(path.join(rootFolder, "src/manipulation/getStructureFunctions.ts"), getStructureCode, { encoding: "utf-8" });
