import { InspectorFactory } from "../inspectors/mod.ts";
import { ensureArrayInputsReadonly } from "./ensureArrayInputsReadonly.ts";
import { ensureClassesImplementStructureMethods } from "./ensureClassesImplementStructureMethods.ts";
import { ensureMixinNotAppliedMultipleTimes } from "./ensureMixinNotAppliedMultipleTimes.ts";
import { ensureOrThrowExists } from "./ensureOrThrowExists.ts";
import { ensureOverloadStructuresMatch } from "./ensureOverloadStructuresMatch.ts";
import { ensurePublicApiHasTests } from "./ensurePublicApiHasTests.ts";
import { ensureStructuresMatchClasses } from "./ensureStructuresMatchClasses.ts";
import { Problem } from "./Problem.ts";
import { validateCodeFences } from "./validateCodeFences.ts";
import { validateCompilerNodeToWrappedType } from "./validateCompilerNodeToWrappedType.ts";
import { validatePublicApiClassMemberNames } from "./validatePublicApiClassMemberNames.ts";

const args = [...Deno.args];
const factory = new InspectorFactory();
let problemsCount = 0;

function addProblem(problem: Problem) {
  console.error(`[${problem.filePath}:${problem.lineNumber}]: ${problem.message}`);
  problemsCount++;
}

if (checkHasArg("ensure-array-inputs-readonly"))
  ensureArrayInputsReadonly(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("ensure-or-throw-exists"))
  ensureOrThrowExists(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("ensure-overload-structures-match"))
  ensureOverloadStructuresMatch(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("ensure-structures-match-classes"))
  ensureStructuresMatchClasses(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("ensure-classes-implement-structure-methods"))
  ensureClassesImplementStructureMethods(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("ensure-mixin-not-applied-multiple-times"))
  ensureMixinNotAppliedMultipleTimes(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("ensure-public-api-has-tests"))
  ensurePublicApiHasTests(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("validate-code-fences"))
  validateCodeFences(factory.getTsMorphInspector(), factory.getTsInspector(), addProblem);
if (checkHasArg("validate-public-api-class-member-names"))
  validatePublicApiClassMemberNames(factory.getTsMorphInspector(), addProblem);
if (checkHasArg("validate-compiler-node-to-wrapped-type"))
  validateCompilerNodeToWrappedType(factory.getTsMorphInspector(), addProblem);

if (args.length > 0)
  console.error(`Unknown args: ${args}`);

if (problemsCount > 0) {
  console.error(`\nFound ${problemsCount} code verification issues.`);
  Deno.exit(1);
}

function checkHasArg(argName: string) {
  const index = args.indexOf(argName);
  if (index === -1)
    return false;

  args.splice(index, 1);
  return true;
}
