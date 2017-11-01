import {ArrayUtils} from "./../src/utils";
import {getAst, getStructureViewModels, getFlattenedExtensions} from "./common";
import {InterfaceViewModel} from "./view-models";
import {isOverloadStructure} from "./config";

const ast = getAst();
const structureVMs = ArrayUtils.from(getStructureViewModels(ast));
const overloadVMs = structureVMs.filter(s => isOverloadStructure(s));
const problems: string[] = [];

for (const overloadVM of overloadVMs) {
    const structureName = overloadVM.name.replace("Overload", "");
    const structureVM = ArrayUtils.find(structureVMs, s => s.name === structureName)!;

    const flattenedOverloadExtensions = getFlattenedExtensions(overloadVM);
    const flattenedStructureExtensions = getFlattenedExtensions(structureVM).filter(s => isAllowedStructure(s));

    for (let i = flattenedOverloadExtensions.length - 1; i >= 0; i--) {
        const findIndex = flattenedStructureExtensions.map(s => s.name).indexOf(flattenedOverloadExtensions[i].name);
        if (findIndex >= 0) {
            flattenedOverloadExtensions.splice(i, 1);
            flattenedStructureExtensions.splice(findIndex, 1);
        }
    }

    for (const remainingOverloadExtension of flattenedOverloadExtensions) {
        problems.push(`Overload extension of ${remainingOverloadExtension.name} does not exist on main structure.`);
    }

    for (const remainingStructureExtension of flattenedStructureExtensions) {
        problems.push(`Structure extension of ${remainingStructureExtension.name} does not exist on overload structure.`);
    }
}

if (problems.length > 0) {
    console.log(problems);
    throw new Error("Overload structure did not match main structure!");
}

function isAllowedStructure(vm: InterfaceViewModel) {
    switch (vm.name) {
        case "NamedStructure":
        case "FunctionLikeDeclarationStructure":
        case "BodiedNodeStructure":
        case "BodyableNodeStructure":
        case "StatementedNodeStructure":
            return false;
    }

    if (vm.name.indexOf("SpecificStructure") > 0)
        return false;

    return true;
}
