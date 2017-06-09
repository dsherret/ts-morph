import * as compiler from "./../compiler";
import * as structures from "./../structures";

export function fillOnlyClassDeclarationFromStructure(node: compiler.ClassDeclaration, structure: structures.ClassSpecificStructure) {
    if (structure.extends != null)
        node.setExtends(structure.extends);
    if (structure.ctor != null)
        node.addConstructor(structure.ctor);
    if (structure.properties != null)
        node.addProperties(structure.properties);
    if (structure.methods != null)
        node.addMethods(structure.methods);
}

export function fillOnlyInterfaceDeclarationFromStructure(node: compiler.InterfaceDeclaration, structure: structures.InterfaceSpecificStructure) {
    if (structure.properties != null)
        node.addProperties(structure.properties);
    if (structure.methods != null)
        node.addMethods(structure.methods);
}

export function fillOnlyNamespaceDeclarationFromStructure(node: compiler.NamespaceDeclaration, structure: structures.NamespaceSpecificStructure) {
    if (structure.hasModuleKeyword != null)
        node.setHasModuleKeyword(structure.hasModuleKeyword);
}
