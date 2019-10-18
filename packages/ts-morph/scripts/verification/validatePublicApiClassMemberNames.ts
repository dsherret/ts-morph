/**
 * Code Verification - Validate Public API Class Member Names
 * ----------------------------------------------------------
 * This code verification validates that private, protected,
 * and internal members of a class have a underscore prefix.
 * ----------------------------------------------------------
 */
import { TypeGuards, ClassMemberTypes, ParameterDeclaration, Scope, ClassDeclaration } from "ts-morph";
import { TsMorphInspector } from "../inspectors";
import { hasInternalDocTag } from "../common";
import { Problem } from "./Problem";

export function validatePublicApiClassMemberNames(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
    for (const classDec of inspector.getPublicClasses().filter(c => isClassToAllow(c))) {
        for (const member of classDec.getMembers())
            validateNode(member);
    }

    function validateNode(node: ClassMemberTypes | ParameterDeclaration) {
        if (TypeGuards.isConstructorDeclaration(node)) {
            node.getParameters().forEach(validateNode);
            return;
        }

        if (node.getScope() === Scope.Protected || node.getScope() === Scope.Private || hasInternalDocTag(node)) {
            if (!node.getName().startsWith("_")) {
                addProblem({
                    filePath: node.getSourceFile().getFilePath(),
                    lineNumber: node.getStartLineNumber(),
                    message: `Class member "${node.getName()}" should have an underscore prefix because it is not public.`
                });
            }
        }
        else if (node.getName().startsWith("_")) {
            addProblem({
                filePath: node.getSourceFile().getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `Class member "${node.getName()}" should NOT have an underscore prefix because it is public.`
            });
        }
    }

    function isClassToAllow(classDec: ClassDeclaration) {
        switch (classDec.getName()) {
            case "CodeBlockWriter":
            case "CompilerCommentStatement":
            case "CompilerCommentClassElement":
            case "CompilerCommentTypeElement":
            case "CompilerCommentObjectLiteralElement":
            case "CompilerCommentEnumMember":
                return false;
            default:
                return true;
        }
    }
}
