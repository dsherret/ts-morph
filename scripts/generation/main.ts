import { ts } from "ts-morph";
import { createGetStructureFunctions } from "./createGetStructureFunctions";
import { createTypeGuardsUtility } from "./createTypeGuardsUtility";
import { createCodeBlockWriterFile } from "./createCodeBlockWriterFile";
import { createKindToNodeMappings } from "./createKindToNodeMappings";
import { createStructurePrinterFactory } from "./createStructurePrinterFactory";
import { createDeclarationFile } from "./createDeclarationFile";
import { createForEachStructureChild } from "./createForEachStructureChild";
import { createStructureTypeGuardsUtility } from "./createStructureTypeGuardsUtility";
import { InspectorFactory } from "../inspectors";

const args = process.argv.slice(2);
const originalArgs = [...args];
const factory = new InspectorFactory();
const inspector = factory.getTsMorphInspector();
const tsInspector = factory.getTsInspector();

(async () => {
    console.log(`TypeScript version: ${ts.version}`);

    if (checkHasArg("create-get-structure-functions")) {
        console.log("Creating get structure functions...");
        createGetStructureFunctions(inspector.getStructures());
    }
    if (checkHasArg("create-type-guards")) {
        console.log("Creating type guards utility class...");
        createTypeGuardsUtility(inspector);
    }
    if (checkHasArg("create-structure-printer-factory")) {
        console.log("Creating structure printer factory...");
        createStructurePrinterFactory(inspector);
    }
    if (checkHasArg("create-code-block-writer-file")) {
        console.log("Creating code block writer file...");
        createCodeBlockWriterFile(inspector);
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
        createStructureTypeGuardsUtility(inspector);
    }

    if (args.length > 0)
        console.error(`Unknown args: ${args}`);

    inspector.getProject().save();
})();

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
