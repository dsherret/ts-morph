/* tslint:disable */
// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate

import * as compiler from "./../compiler";
import * as structures from "./../structures";
import * as getMixinStructureFuncs from "./getMixinStructureFunctions";

export function fromFunctionDeclarationOverload(node: compiler.FunctionDeclaration): structures.FunctionDeclarationOverloadStructure {
    let structure: structures.FunctionDeclarationOverloadStructure = {} as any;
    Object.assign(structure, getMixinStructureFuncs.fromAmbientableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromExportableNode(node));
    return structure;
}
