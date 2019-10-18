export function isOverloadStructure(name: string) {
    switch (name) {
        case "FunctionDeclarationOverloadStructure":
        case "MethodDeclarationOverloadStructure":
        case "ConstructorDeclarationOverloadStructure":
            return true;
        default:
            return false;
    }
}
