import {createGetStructureFunctions} from "./createGetStructureFunctions";
import {createTypeGuardsUtility} from "./createTypeGuardsUtility";
import {createCompilerApiLayer} from "./createCompilerApiLayer";
import {createKindToNodeMappings} from "./createKindToNodeMappings";
import {InspectorFactory} from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();
const tsInspector = factory.getTsInspector();

// create
console.log("Creating get structure functions...");
createGetStructureFunctions(inspector.getStructures());
console.log("Creating type guards utility class...");
createTypeGuardsUtility(inspector);
console.log("Creating compiler api layer...");
createCompilerApiLayer(factory);
console.log("Creating kind to node mappings...");
createKindToNodeMappings(inspector, tsInspector);

inspector.getProject().save();
