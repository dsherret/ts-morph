import { getProject, printDiagnostics } from "./common";

const project = getProject();
const diagnostics = project.getPreEmitDiagnostics();

printDiagnostics(diagnostics);

if (diagnostics.length > 0)
    process.exit(1);
