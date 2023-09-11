import { tsMorph } from "../deps.ts";
import { InspectorFactory } from "../inspectors/mod.ts";
import { createDeclarationFile } from "./createDeclarationFile.ts";
import { createForEachStructureChild } from "./createForEachStructureChild.ts";
import { createGetStructureFunctions } from "./createGetStructureFunctions.ts";
import { createKindToNodeMappings } from "./createKindToNodeMappings.ts";
import { createNodeTypeGuards } from "./createNodeTypeGuards.ts";
import { createStructurePrinterFactory } from "./createStructurePrinterFactory.ts";
import { createStructureTypeGuards } from "./createStructureTypeGuards.ts";

const args = [...Deno.args];
const originalArgs = [...args];
const factory = new InspectorFactory();
const inspector = factory.getTsMorphInspector();
const tsInspector = factory.getTsInspector();

if (checkHasArg("create-get-structure-functions")) {
  console.log("Creating get structure functions...");
  createGetStructureFunctions(inspector.getStructures());
}
if (checkHasArg("create-type-guards")) {
  console.log("Creating node type guards...");
  createNodeTypeGuards(inspector, tsInspector);
}
if (checkHasArg("create-structure-printer-factory")) {
  console.log("Creating structure printer factory...");
  createStructurePrinterFactory(inspector);
}
if (checkHasArg("create-kind-to-node-mappings")) {
  console.log("Creating kind to node mappings...");
  createKindToNodeMappings(inspector, tsInspector);
}
if (checkHasExplicitArg("create-declaration-file")) {
  console.log("Creating declaration file...");
  await createDeclarationFile();
}
if (checkHasArg("create-for-each-structure-child")) {
  console.log("Creating for each structure child...");
  createForEachStructureChild(inspector);
}
if (checkHasArg("create-structure-type-guards")) {
  console.log("Creating structure type guards utility class...");
  createStructureTypeGuards(inspector);
}

if (args.length > 0)
  console.error(`Unknown args: ${args}`);

await inspector.getProject().save();

function checkHasArg(argName: string) {
  if (originalArgs.length === 0)
    return true; // run all

  return checkHasExplicitArg(argName);
}

function checkHasExplicitArg(argName: string) {
  const index = args.indexOf(argName);
  if (index === -1)
    return false;

  args.splice(index, 1);
  return true;
}
