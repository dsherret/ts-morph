import {Type} from "../../src/compiler";
import {ArrayUtils} from "../../src/utils";

export function isNodeType(type: Type) {
    return type.getText() === "Node<NodeType>";
}

export function hasDescendantNodeType(type: Type) {
    return hasDescendantBaseType(type, isNodeType);
}

export function hasDescendantBaseType(type: Type, isMatch: (type: Type) => boolean): boolean {
    return getDescendantBaseType(type, isMatch) != null;
}

export function getDescendantBaseType(type: Type, isMatch: (type: Type) => boolean): Type | undefined {
    if (type.isIntersectionType()) {
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
