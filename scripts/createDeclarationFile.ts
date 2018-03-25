/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the definition file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import * as path from "path";
import Project, {SourceFile, ClassDeclaration, TypeGuards, ts, SyntaxKind} from "../src/main";
import {StringUtils, ArrayUtils} from "../src/utils";
import {getDefinitionProject} from "./common";
import {flattenDeclarationFiles} from "./flattenDeclarationFiles";

const project = getDefinitionProject();
const mainFile = project.getSourceFileOrThrow("main.d.ts");

flattenDeclarationFiles(project, mainFile);

project.save();
