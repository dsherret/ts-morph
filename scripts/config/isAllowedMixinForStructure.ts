export function isAllowedMixinForStructure(mixinName: string, structureName: string) {
    // todo: maybe inline this in the code with a comment?

    if (structureName === "PropertyAssignmentStructure")
        return mixinName !== "QuestionTokenableNode";
    if (structureName === "ShorthandPropertyAssignmentStructure")
        return mixinName !== "QuestionTokenableNode";
    if (structureName === "VariableDeclarationStructure")
        return mixinName !== "ExportGetableNode";
    if (structureName === "EnumMemberStructure")
        return mixinName !== "InitializerExpressionableNode";

    return true;
}
