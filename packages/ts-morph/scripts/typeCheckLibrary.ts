import { printDiagnostics } from "@ts-morph/scripts";
import { getProject } from "./common";

const project = getProject();
const diagnostics = project.getPreEmitDiagnostics();

printDiagnostics(diagnostics);

console.log(`Found ${diagnostics.length} diagnostics.`);

if (diagnostics.length > 0)
    process.exit(1);
