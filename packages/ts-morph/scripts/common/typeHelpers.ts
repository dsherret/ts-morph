import { tsMorph } from "@ts-morph/scripts";

export function isNodeType(type: tsMorph.Type) {
    return type.getText().endsWith("Node<NodeType>");
}

export function hasDescendantNodeType(type: tsMorph.Type) {
    return hasDescendantBaseType(type, isNodeType);
}

export function hasDescendantBaseType(type: tsMorph.Type, isMatch: (type: tsMorph.Type) => boolean): boolean {
    return getDescendantBaseType(type, isMatch) != null;
}

export function getDescendantBaseType(type: tsMorph.Type, isMatch: (type: tsMorph.Type) => boolean): tsMorph.Type | undefined {
    if (type.isIntersection()) {
        for (const intersectionType of type.getIntersectionTypes()) {
            const descendantType = getDescendantBaseType(intersectionType, isMatch);
            if (descendantType != null)
                return descendantType;
        }
        return undefined;
    }

    if (isMatch(type))
        return type;

    const targetType = type.getTargetType();
    if (targetType != null && isMatch(targetType))
        return targetType;

    const allBaseTypes = type.getBaseTypes();
    if (targetType != null)
        allBaseTypes.push(...targetType.getBaseTypes());

    for (const baseType of allBaseTypes) {
        const descendantType = getDescendantBaseType(baseType, isMatch);
        if (descendantType != null)
            return descendantType;
    }

    return undefined;
}
