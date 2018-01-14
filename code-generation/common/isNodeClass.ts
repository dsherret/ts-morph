import {ClassDeclaration, Type} from "./../../src/compiler";

export function isNodeClass(classDec: ClassDeclaration) {
    const shouldLog = classDec.getName() === "WhileStatement";
    const result = classDec.getBaseTypes().some(t => isNodeType(t));
    return result;

    function isNodeType(type: Type): boolean {
        if (type.isIntersectionType())
            return type.getIntersectionTypes().some(t => isNodeType(t));

        const targetType = type.getTargetType();
        if (targetType != null && targetType.getText() === "Node<NodeType>")
            return true;

        const allBaseTypes = type.getBaseTypes();
        if (targetType != null)
            allBaseTypes.push(...targetType.getBaseTypes());

        return allBaseTypes.some(t => isNodeType(t));
    }
}
