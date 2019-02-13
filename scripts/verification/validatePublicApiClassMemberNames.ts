/**
 * Code Verification - Validate Public API Class Member Names
 * ----------------------------------------------------------
 * This code verification validates that private, protected,
 * and internal members of a class have a underscore prefix.
 * ----------------------------------------------------------
 */
import { TypeGuards, ClassMemberTypes, ParameterDeclaration, Scope } from "ts-morph";
import { TsSimpleAstInspector } from "../inspectors";
import { hasInternalDocTag } from "../common";
import { Problem } from "./Problem";

export function validatePublicApiClassMemberNames(inspector: TsSimpleAstInspector, addProblem: (problem: Problem) => void) {
    const codeBlockWriterClass = inspector.getCodeBlockWriterClass();

    for (const classDec of inspector.getPublicClasses().filter(c => c !== codeBlockWriterClass)) {
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
}
