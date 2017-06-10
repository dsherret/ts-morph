import {ClassViewModel} from "./../view-models";

export function isAllowedClass(classVM: ClassViewModel) {
    switch (classVM.name) {
        // not supported yet...
        case "GetAccessorDeclaration":
        case "SetAccessorDeclaration":
        case "VariableStatement":
        case "VariableDeclaration":
        case "VariableDeclarationList":
            return false;
        default:
            return true;
    }
}
