/* tslint:disable */
// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate

import * as compiler from "../../compiler";
import * as structures from "../../structures";
import { ObjectUtils } from "../../utils";
import * as getMixinStructureFuncs from "./getMixinStructureFunctions";

export function fromConstructorDeclarationOverload(node: compiler.ConstructorDeclaration): structures.ConstructorDeclarationOverloadStructure {
    const structure: structures.ConstructorDeclarationOverloadStructure = {} as any;
    ObjectUtils.assign(structure, getMixinStructureFuncs.fromScopedNode(node));
    return structure;
}

export function fromMethodDeclarationOverload(node: compiler.MethodDeclaration): structures.MethodDeclarationOverloadStructure {
    const structure: structures.MethodDeclarationOverloadStructure = {} as any;
    ObjectUtils.assign(structure, getMixinStructureFuncs.fromStaticableNode(node));
    ObjectUtils.assign(structure, getMixinStructureFuncs.fromAbstractableNode(node));
    ObjectUtils.assign(structure, getMixinStructureFuncs.fromScopedNode(node));
    ObjectUtils.assign(structure, getMixinStructureFuncs.fromQuestionTokenableNode(node));
    return structure;
}

export function fromFunctionDeclarationOverload(node: compiler.FunctionDeclaration): structures.FunctionDeclarationOverloadStructure {
    const structure: structures.FunctionDeclarationOverloadStructure = {} as any;
    ObjectUtils.assign(structure, getMixinStructureFuncs.fromAmbientableNode(node));
    ObjectUtils.assign(structure, getMixinStructureFuncs.fromExportableNode(node));
    return structure;
}