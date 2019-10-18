export function isAllowedMixinForStructure(mixinName: string, structureName: string) {
    if (structureName === "PropertyAssignmentStructure")
        return mixinName !== "QuestionTokenableNode";
    if (structureName === "ShorthandPropertyAssignmentStructure")
        return mixinName !== "QuestionTokenableNode";
    if (structureName === "VariableDeclarationStructure")
        return mixinName !== "ExportGetableNode";

    return true;
}
