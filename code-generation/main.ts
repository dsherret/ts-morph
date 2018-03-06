import {createGetStructureFunctions} from "./createGetStructureFunctions";
import {createTypeGuardsUtility} from "./createTypeGuardsUtility";
import {createCompilerApiLayer} from "./createCompilerApiLayer";
import {InspectorFactory} from "./inspectors";
import {SyntaxKind, Identifier} from "./../src/main";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

// create
/*console.log("Creating get structure functions...");
createGetStructureFunctions(inspector.getStructures());
console.log("Creating type guards utility class...");
createTypeGuardsUtility(inspector);
console.log("Creating compiler api layer...");
createCompilerApiLayer(factory);
*/

const dir = inspector.getProject().getDirectoryOrThrow("src");
for (const sourceFile of dir.getDescendantSourceFiles()) {
    for (const identifier of sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)) {
        if (identifier.getText() === "ast")
            (identifier as Identifier).rename("project");
    }
}

inspector.getProject().save();
