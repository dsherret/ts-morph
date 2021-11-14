import { printDiagnostics } from "../../scripts/mod.ts";
import { getProject } from "./common/mod.ts";

const project = getProject();
const diagnostics = project.getPreEmitDiagnostics();

printDiagnostics(diagnostics);

console.log(`Found ${diagnostics.length} diagnostics.`);

if (diagnostics.length > 0)
  process.exit(1);
