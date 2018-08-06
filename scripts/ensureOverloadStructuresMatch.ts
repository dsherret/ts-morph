/**
 * Code Verification - Ensure Overload Structures Match.
 * -----------------------------------------------------
 * When a developer adds another interface to a structure like MethodDeclaration (ex. ScopableNodeStructure),
 * then we need to ensure that same structure was also added to MethodOverloadDeclaration.
 *
 * This code verification ensures that an overload structure matches its "implementation" structure.
 * -----------------------------------------------------
 */
import { ArrayUtils } from "../src/utils";
import { InspectorFactory, Structure } from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

// get structures
const structures = inspector.getStructures();
const overloadStructures = inspector.getOverloadStructures();

// find the problems
const problems: string[] = [];
for (const overloadStructure of overloadStructures) {
    const structureName = overloadStructure.getName().replace("Overload", "");
    const structure = ArrayUtils.find(structures, s => s.getName() === structureName);

    if (structure == null)
        throw new Error(`Could not find structure for overload: ${overloadStructure.getName()}`);

    const overloadBaseStructures = overloadStructure.getDescendantBaseStructures();
    const structureBaseStructures = structure.getDescendantBaseStructures().filter(s => isAllowedStructure(s));

    for (let i = overloadBaseStructures.length - 1; i >= 0; i--) {
        const findIndex = structureBaseStructures.map(s => s.getName()).indexOf(overloadBaseStructures[i].getName());
        if (findIndex >= 0) {
            overloadBaseStructures.splice(i, 1);
            structureBaseStructures.splice(findIndex, 1);
        }
    }

    for (const remainingOverload of overloadBaseStructures)
        problems.push(`${overloadStructure.getName()}: Overload extension of ${remainingOverload.getName()} does not exist on main structure.`);

    for (const remainingStructure of structureBaseStructures)
        problems.push(`${overloadStructure.getName()}: Structure extension of ${remainingStructure.getName()} does not exist on overload structure.`);
}

// output
if (problems.length > 0) {
    console.log(problems);
    console.error("Overload structure did not match main structure!");
    process.exit(1);
}

function isAllowedStructure(structure: Structure) {
    switch (structure.getName()) {
        case "NamedNodeStructure":
        case "NameableNodeStructure":
        case "PropertyNamedNodeStructure":
        case "FunctionLikeDeclarationStructure":
        case "BodiedNodeStructure":
        case "BodyableNodeStructure":
        case "StatementedNodeStructure":
            return false;
    }

    if (structure.getName().indexOf("SpecificStructure") > 0)
        return false;

    return true;
}
