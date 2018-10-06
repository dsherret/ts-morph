import { getProject } from "./common";

const project = getProject();
const diagnostics = project.getPreEmitDiagnostics();

for (const diagnostic of diagnostics)
    console.log(`[${diagnostic.getSourceFile().getFilePath()}:${diagnostic.getLineNumber()}]: ${diagnostic.getMessageText()}`);

if (diagnostics.length > 0)
    process.exit(1);
