import * as compiler from "./../compiler";
import * as structures from "./../structures";

export function fillOnlyClassDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.ClassDeclaration, structure: structures.ClassSpecificStructure) {
    if (structure.properties != null)
        node.addProperties(structure.properties, sourceFile);
    if (structure.ctor != null)
        node.addConstructor(structure.ctor, sourceFile);
    if (structure.methods != null)
        node.addMethods(structure.methods, sourceFile);
}
