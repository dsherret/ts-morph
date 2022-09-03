// dprint-ignore-file
// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate

import { ObjectUtils } from "@ts-morph/common";
import * as compiler from "../../compiler";
import * as structures from "../../structures";
import * as getMixinStructureFuncs from "./getMixinStructureFunctions";

export function fromConstructorDeclarationOverload(node: compiler.ConstructorDeclaration): structures.ConstructorDeclarationOverloadStructure {
    const structure: structures.ConstructorDeclarationOverloadStructure = {} as any;
    Object.assign(structure, getMixinStructureFuncs.fromScopedNode(node));
    return structure;
}

export function fromFunctionDeclarationOverload(node: compiler.FunctionDeclaration): structures.FunctionDeclarationOverloadStructure {
    const structure: structures.FunctionDeclarationOverloadStructure = {} as any;
    Object.assign(structure, getMixinStructureFuncs.fromAmbientableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromExportableNode(node));
    return structure;
}

export function fromMethodDeclarationOverload(node: compiler.MethodDeclaration): structures.MethodDeclarationOverloadStructure {
    const structure: structures.MethodDeclarationOverloadStructure = {} as any;
    Object.assign(structure, getMixinStructureFuncs.fromStaticableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromAbstractableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromScopedNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromQuestionTokenableNode(node));
    Object.assign(structure, getMixinStructureFuncs.fromOverrideableNode(node));
    return structure;
}
