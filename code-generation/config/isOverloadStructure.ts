import {InterfaceViewModel} from "./../view-models";

export function isOverloadStructure(vm: InterfaceViewModel) {
    switch (vm.name) {
        case "FunctionDeclarationOverloadStructure":
        case "MethodDeclarationOverloadStructure":
        case "ConstructorDeclarationOverloadStructure":
            return true;
        default:
            return false;
    }
}
