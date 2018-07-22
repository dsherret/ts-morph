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

        // TODO: things like InitializerExpressionableNode, FunctionLikeDeclaration will always fail because
        // getStructure will be never implemented for them. We need to check that class
        // baseStructure.getNsame() and baseStructure.getName().replace(/Structure$/, 'SpecificStructure')
        // classes are not empty like in the case of these cllsses - if so we skip them and warn the user.
        let declarationName: string = baseStructure.getName().replace(/Structure$/, "");

        // // Abstract things like FunctionLikeDeclaration that are just composition of other mixins
        // if (!isThereClassOrInterfaceDeclarationNamed(declarationName)){
        //     problems.push(`WARNING, Skipping ${declarationName} since no type was found with that name. Verify it's OK`);
        //     continue;
        // }

        let declaration: InterfaceDeclaration | undefined = interfaces.find(c => c.getName() === declarationName);
        if (declaration && !declaration.getImplementations().length) {
            declaration = interfaces.find(c => c.getName() === declarationName + "Specific");
        }
        let problem: string = "";
        if (declaration && declaration.getImplementations().length) {
            if (!declaration.getImplementations().find(loc =>
                !!loc.getNode().getDescendants().find(d => TypeGuards.isMethodDeclaration(d) && d.getName() === "getStructure")))
                problem = `Expected method ${declarationName}.getStructure to be implemented since type ${structureName} exists`;

        }
        else if (declaration && !declaration.getImplementations().length)
            problem = `Expected to find implementations for declaration ${declarationName}`;

        else {
            declarationName = declarationName.replace(/Specific$/, "");
            const decl = classes.find(c => c.getName() === declarationName);
            if (!decl || !decl.getMethod("getStructure"))
                problem = `Expected method ${declarationName}.getStructure to be implemented since type ${structureName} exists`;
        }

        if (problem) {
            problems.push(problem);
            console.log(declarationName);
        }
    }
}

// output
if (problems.length > 0) {
    console.log(problems);
    console.error("Some classes miss to implement getStructure method!");
    process.exit(1);
}

// function isThereClassOrInterfaceDeclarationNamed(name: string): boolean {
//     return !!classes.find(c => c.getName() === name) ||
//         !!interfaces.find(i => i.getName() === name) ||
//         !!interfaces.find(i => i.getName() === name + "Specific");
// }
