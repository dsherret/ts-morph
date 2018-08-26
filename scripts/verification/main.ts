import { InspectorFactory } from "../inspectors";
import { ensureArrayInputsReadonly } from "./ensureArrayInputsReadonly";
import { ensureOrThrowExists } from "./ensureOrThrowExists";
import { ensureOverloadStructuresMatch } from "./ensureOverloadStructuresMatch";
import { ensureStructuresMatchClasses } from "./ensureStructuresMatchClasses";
import { Problem } from "./Problem";

const args = process.argv.slice(2);
const factory = new InspectorFactory();
const problems: Problem[] = [];

if (checkHasArg("ensure-array-inputs-readonly"))
    ensureArrayInputsReadonly(factory.getTsSimpleAstInspector(), problems);
if (checkHasArg("ensure-or-throw-exists"))
    ensureOrThrowExists(factory.getTsSimpleAstInspector(), problems);
if (checkHasArg("ensure-overload-structures-match"))
    ensureOverloadStructuresMatch(factory.getTsSimpleAstInspector(), problems);
if (checkHasArg("ensure-structures-match-classes"))
    ensureStructuresMatchClasses(factory.getTsSimpleAstInspector(), problems);

if (args.length > 0)
    console.error(`Unknown args: ${args}`);

if (problems.length > 0) {
    problems.forEach(p => console.error(`[${p.filePath}:${p.lineNumber}]: ${p.message}`));
    console.error(`\nFound ${problems.length} code verification issues.`);
    process.exit(1);
}

function checkHasArg(argName: string) {
    const index = args.indexOf(argName);
    if (index === -1)
        return false;

    args.splice(index, 1);
    return true;
}
