/* tslint:disable */
// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate

import * as objectAssign from "object-assign";
import * as compiler from "../../compiler";
import * as structures from "../../structures";
import * as getMixinStructureFuncs from "./getMixinStructureFunctions";

export function fromConstructorDeclarationOverload(node: compiler.ConstructorDeclaration): structures.ConstructorDeclarationOverloadStructure {
    let structure: structures.ConstructorDeclarationOverloadStructure = {} as any;
    objectAssign(structure, getMixinStructureFuncs.fromScopedNode(node));
    return structure;
}
export function fromMethodDeclarationOverload(node: compiler.MethodDeclaration): structures.MethodDeclarationOverloadStructure {
    let structure: structures.MethodDeclarationOverloadStructure = {} as any;
    objectAssign(structure, getMixinStructureFuncs.fromStaticableNode(node));
    objectAssign(structure, getMixinStructureFuncs.fromAbstractableNode(node));
    objectAssign(structure, getMixinStructureFuncs.fromScopedNode(node));
    return structure;
}
export function fromFunctionDeclarationOverload(node: compiler.FunctionDeclaration): structures.FunctionDeclarationOverloadStructure {
    let structure: structures.FunctionDeclarationOverloadStructure = {} as any;
    objectAssign(structure, getMixinStructureFuncs.fromAmbientableNode(node));
    objectAssign(structure, getMixinStructureFuncs.fromExportableNode(node));
    return structure;
}