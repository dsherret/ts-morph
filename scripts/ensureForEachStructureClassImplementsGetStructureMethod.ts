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
import { InspectorFactory } from "./inspectors";
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

for (const node of nodes) {
    const structureName = node.getName() + "Structure";

    const structure = ArrayUtils.find(structures, s => s.getName() === structureName);
    if (structure == null)
        continue;

    for (const baseStructure of structure.getBaseStructures()) {
        const declarationName: string = baseStructure.getName().replace(/Structure$/, "");
        let declaration: InterfaceDeclaration | undefined = interfaces.find(c => c.getName() === declarationName);
        if (declaration && !declaration.getImplementations().length) {
            declaration = interfaces.find(c => c.getName() === declarationName + "Specific");
        }
        // let found: boolean = false;
        let problem: string = "";
        if (declaration && declaration.getImplementations().length) {
            // found = !!;
            if (!declaration.getImplementations().find(loc =>
                !!loc.getNode().getDescendants().find(d => TypeGuards.isMethodDeclaration(d) && d.getName() === "getStructure")))
                problem = `Expected method ${declarationName}.getStructure to be implemented since type ${structureName} exists`;

        }
        else if (declaration && !declaration.getImplementations().length) {
            // declarationName = declarationName.replace(/Specific$/, "");
            problem = `Expected to find implementations for declaration ${declarationName}`
        }

        else {
            const c = classes.find(c => c.getName() === declarationName)
            if (!c || !c.getMethod("getStructure"))
                problem = `Expected method ${declarationName}.getStructure to be implemented since type ${structureName} exists`;
            // declaration = undefined

        }

        problems.push(problem)
        console.log(declarationName, problem || "OK");
    }
}

// output
if (problems.length > 0) {
    console.log(problems);
    console.error("Some classes miss to implement getStructure method!");
    process.exit(1);
}

function getStructureName(name: string) {
    return name + "Structure";
}
