import { StructureTypeGuards, Structures, forEachStructureChild, WriterFunction } from "ts-morph";

export function forEachTypeText(structure: Structures, func: (typeText: string) => string) {
    forEachChild(structure);

    function forEachChild(child: Structures) {
        if (StructureTypeGuards.isTyped(child) && child.type != null)
            child.type = withType(child.type);
        if (StructureTypeGuards.isReturnTyped(child) && child.returnType != null)
            child.returnType = withType(child.returnType);
        if (StructureTypeGuards.isTypeParameter(child) && child.constraint != null)
            child.constraint = withType(child.constraint);

        forEachStructureChild(child, forEachChild);
    }

    function withType(text: string | WriterFunction) {
        if (typeof text !== "string")
            throw new Error("Unhandled scenario where the type text was not a string.");

        return func(text);
    }
}
