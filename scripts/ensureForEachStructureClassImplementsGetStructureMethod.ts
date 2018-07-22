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
import { TypeGuards } from 'ts-simple-ast';

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

const compilerSourceFiles = inspector.getProject().getSourceFiles("src/compiler/**/*.ts");
const interfaces = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getInterfaces()));

// get info
const nodes = inspector.getWrappedNodes();
const structures = inspector.getStructures();

// find problems
const problems: string[] = [];

for (const node of nodes) {
    const structureName = node.getName() + 'Structure';

    const structure = ArrayUtils.find(structures, s => s.getName() === structureName);
    if (structure == null)
        continue;

    for (const baseStructure of structure.getBaseStructures()) {
        const declarationName = baseStructure.getName().replace(/Structure$/, "");
        let declaration = interfaces.find(c => c.getName() === declarationName);
        if (declaration && !declaration.getImplementations().length) {
            declaration = interfaces.find(c => c.getName() === declarationName + "Specific")
        }
        if (!declaration) {
            problems.push(`Expected to find declaration for ${declarationName}`);
            break;
        }
        const implementsGetStructure = declaration.getImplementations().find(loc =>
            !!loc.getNode().getDescendants().find(d => TypeGuards.isMethodDeclaration(d) && d.getName() === 'getStructure'))

        if (!implementsGetStructure)
            problems.push(`Expected method ${declarationName}.getStructure to be implemented since type ${structureName} exists`);
        console.log(declarationName, !!implementsGetStructure);
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
