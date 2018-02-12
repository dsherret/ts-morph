import {createGetStructureFunctions} from "./createGetStructureFunctions";
import {createTypeGuardsUtility} from "./createTypeGuardsUtility";
import {createCompilerApiLayer} from "./createCompilerApiLayer";
import {InspectorFactory} from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

// create
console.log("Creating get structure functions...");
createGetStructureFunctions(inspector.getStructures());
console.log("Creating type guards utility class...");
createTypeGuardsUtility(inspector);
console.log("Creating compiler api layer...");
createCompilerApiLayer(factory);
