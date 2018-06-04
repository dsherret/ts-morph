import { createGetStructureFunctions } from "./createGetStructureFunctions";
import { createTypeGuardsUtility } from "./createTypeGuardsUtility";
import { createCompilerApiLayer } from "./createCompilerApiLayer";
import { createCodeBlockWriterFile } from "./createCodeBlockWriterFile";
import { createKindToNodeMappings } from "./createKindToNodeMappings";
import { createCompilerNodeBrandPropertyNamesType } from "./createCompilerNodeBrandPropertyNamesType";
import { createCompilerNodeToWrappedType } from "./createCompilerNodeToWrappedType";
import { createStructurePrinterFactory } from "./createStructurePrinterFactory";
import { InspectorFactory } from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();
const tsInspector = factory.getTsInspector();

// create
console.log("Creating get structure functions...");
createGetStructureFunctions(inspector.getStructures());
console.log("Creating type guards utility class...");
createTypeGuardsUtility(inspector);
console.log("Creating structure printer factory...");
createStructurePrinterFactory(inspector);
console.log("Creating code block writer file...");
createCodeBlockWriterFile(inspector);
console.log("Creating compiler api layer...");
createCompilerApiLayer(factory);
console.log("Creating kind to node mappings...");
createKindToNodeMappings(inspector, tsInspector);
console.log("Creating compiler node brand property names type...");
createCompilerNodeBrandPropertyNamesType(tsInspector);
console.log("Creating compiler node to wrapped type...");
createCompilerNodeToWrappedType(inspector);

inspector.getProject().save();
