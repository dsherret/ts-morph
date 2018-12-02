import { InspectorFactory } from "../inspectors";
import { ensureArrayInputsReadonly } from "./ensureArrayInputsReadonly";
import { ensureOrThrowExists } from "./ensureOrThrowExists";
import { ensureOverloadStructuresMatch } from "./ensureOverloadStructuresMatch";
import { ensureStructuresMatchClasses } from "./ensureStructuresMatchClasses";
import { ensureClassesImplementStructureMethods } from "./ensureClassesImplementStructureMethods";
import { ensurePublicApiHasTests } from "./ensurePublicApiHasTests";
import { validatePublicApiClassMemberNames } from "./validatePublicApiClassMemberNames";
import { validateCompilerNodeToWrappedType } from "./validateCompilerNodeToWrappedType";
import { Problem } from "./Problem";

const args = process.argv.slice(2);
const factory = new InspectorFactory();
let problemsCount = 0;

function addProblem(problem: Problem) {
    console.error(`[${problem.filePath}:${problem.lineNumber}]: ${problem.message}`);
    problemsCount++;
}

if (checkHasArg("ensure-array-inputs-readonly"))
    ensureArrayInputsReadonly(factory.getTsSimpleAstInspector(), addProblem);
if (checkHasArg("ensure-or-throw-exists"))
    ensureOrThrowExists(factory.getTsSimpleAstInspector(), addProblem);
if (checkHasArg("ensure-overload-structures-match"))
    ensureOverloadStructuresMatch(factory.getTsSimpleAstInspector(), addProblem);
if (checkHasArg("ensure-structures-match-classes"))
    ensureStructuresMatchClasses(factory.getTsSimpleAstInspector(), addProblem);
if (checkHasArg("ensure-classes-implement-structure-methods"))
    ensureClassesImplementStructureMethods(factory.getTsSimpleAstInspector(), addProblem);
if (checkHasArg("ensure-public-api-has-tests"))
    ensurePublicApiHasTests(factory.getTsSimpleAstInspector(), addProblem);
if (checkHasArg("validate-public-api-class-member-names"))
    validatePublicApiClassMemberNames(factory.getTsSimpleAstInspector(), addProblem);
if (checkHasArg("validate-compiler-node-to-wrapped-type"))
    validateCompilerNodeToWrappedType(factory.getTsSimpleAstInspector(), addProblem);

if (args.length > 0)
    console.error(`Unknown args: ${args}`);

if (problemsCount > 0) {
    console.error(`\nFound ${problemsCount} code verification issues.`);
    process.exit(1);
}

function checkHasArg(argName: string) {
    const index = args.indexOf(argName);
    if (index === -1)
        return false;

    args.splice(index, 1);
    return true;
}
