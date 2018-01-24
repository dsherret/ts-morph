import * as path from "path";
import * as fs from "fs";
import {rootFolder} from "./config";
import {createGetStructureFunctions} from "./createGetStructureFunctions";
import {createTypeGuardsUtility} from "./createTypeGuardsUtility";
import {InspectorFactory} from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

// get structure functions
const getStructureCode = createGetStructureFunctions(inspector.getStructures());
fs.writeFileSync(path.join(rootFolder, "src/manipulation/helpers/getStructureFunctions.ts"), getStructureCode, { encoding: "utf-8" });

// create the TypeGuard class
createTypeGuardsUtility(inspector);
