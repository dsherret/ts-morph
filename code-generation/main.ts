import * as path from "path";
import * as fs from "fs";
import {createGetStructureFunctions} from "./createGetStructureFunctions";
import {createTypeGuardsUtility} from "./createTypeGuardsUtility";
import {createNodePolyfills} from "./createNodePolyfills";
import {InspectorFactory} from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

// create
createGetStructureFunctions(inspector.getStructures());
createTypeGuardsUtility(inspector);
createNodePolyfills(factory);
