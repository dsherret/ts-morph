import {InterfaceViewModel} from "./../view-models";

export function isOverloadStructure(vm: InterfaceViewModel) {
    switch (vm.name) {
        case "FunctionDeclarationOverloadStructure":
            return true;
        default:
            return false;
    }
}
