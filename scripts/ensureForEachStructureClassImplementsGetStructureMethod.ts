/**
 * Code Verification - Ensure Structures Match Classes.
 * ----------------------------------------------------
 * For example, because there is a ClassDeclarationStructure then ClassDeclaration must implement method
 * getStructure
 *
 * This code verification ensures that for each Structure its corresponding class implements getStructure method
 * ----------------------------------------------------
 */
import { ArrayUtils } from "../src/utils";
import { InspectorFactory, Structure } from "./inspectors";
import { TypeGuards, InterfaceDeclaration } from "ts-simple-ast";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

const compilerSourceFiles = inspector.getProject().getSourceFiles("src/compiler/**/*.ts");
const interfaces = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getInterfaces()));

const classes = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getClasses()));

// get info
const nodes = inspector.getWrappedNodes();
const structures = inspector.getStructures();

// find problems
const problems: string[] = [];
const oks: string[] = [];
const ignoreDeclarations = [
    'FunctionLikeDeclaration',
    'InitializerExpressionableNode' // because extends InitializerSetExpressionableNode and it does implements it
]

function verifyStructure(structureName: string, baseStructure: Structure) {
    let declarationName: string = baseStructure.getName().replace(/Structure$/, "");
    if (ignoreDeclarations.includes(declarationName)) {
        return;
    }
    let declaration: InterfaceDeclaration | undefined = interfaces.find(c => c.getName() === declarationName);
    if (declaration && !declaration.getImplementations().length) {
        declaration = interfaces.find(c => c.getName() === declarationName + "Specific");
    }
    let problem: string = "";
    let ok: string = "";
    if (declaration && declaration.getImplementations().length) {
        if (!declaration.getImplementations().find(loc =>
            !!loc.getNode().getDescendants().find(d => TypeGuards.isMethodDeclaration(d) && d.getName() === "getStructure")))
            problem = `Expected method ${declarationName}.getStructure to be implemented since type ${structureName} exists`;
        else
            ok = `declaration implementation found ${declaration.getName()}`;
    }
    else if (declaration && !declaration.getImplementations().length)
        problem = `Expected to find implementations for declaration ${declarationName}`;
    else {
        declarationName = declarationName.replace(/Specific$/, "");
        const decl = classes.find(c => c.getName() === declarationName);
        if (!decl || !decl.getMethod("getStructure"))
            problem = `Expected method ${declarationName}.getStructure to be implemented since type ${structureName} exists`;
        else
            oks.push(`class found ${decl.getName()}`)
    }
    if (problem) {
        problems.push(problem);
        console.log(declarationName, { ok, problem });
    }
}


for (const node of nodes) {
    const structureName = node.getName() + "Structure";
    const structure = ArrayUtils.find(structures, s => s.getName() === structureName);
    if (structure == null)
        continue;
    verifyStructure(structureName, structure)
    for (const baseStructure of structure.getBaseStructures())
        verifyStructure(structureName, baseStructure);
}

// output
if (problems.length > 0) {
    console.log(problems.filter((v, i, arr) => arr.indexOf(v) === i).sort());
    console.error("Some classes miss to implement getStructure method!");
    process.exit(1);
}