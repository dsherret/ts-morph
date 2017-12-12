import * as path from "path";
import * as fs from "fs";
import {rootFolder, isOverloadStructure} from "./config";
import {getAst, getClassViewModels, getStructureViewModels, getNodeToWrapperMappings} from "./common";
import {createGetStructureFunctions} from "./createGetStructureFunctions";
import {createTypeGuardsUtility} from "./createTypeGuardsUtility";

const ast = getAst();
const classVMs = Array.from(getClassViewModels(ast));
const structureVMs = Array.from(getStructureViewModels(ast));
// const overloadStructureVMs = structureVMs.filter(s => isOverloadStructure(s));
const nodeToWrapperVMs = getNodeToWrapperMappings(getAst());

// get structure functions
const getStructureCode = createGetStructureFunctions(structureVMs);
fs.writeFileSync(path.join(rootFolder, "src/manipulation/getStructureFunctions.ts"), getStructureCode, { encoding: "utf-8" });

// create the TypeGuard class
createTypeGuardsUtility(ast, classVMs, nodeToWrapperVMs);
