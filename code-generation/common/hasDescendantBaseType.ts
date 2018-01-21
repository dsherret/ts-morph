import {Type} from "./../../src/compiler";

export function hasDescendantBaseType(type: Type, isMatch: (type: Type) => boolean): boolean {
    if (type.isIntersectionType())
        return type.getIntersectionTypes().some(t => hasDescendantBaseType(t, isMatch));

    if (isMatch(type))
        return true;

    const targetType = type.getTargetType();
    if (targetType != null && isMatch(targetType))
        return true;

    const allBaseTypes = type.getBaseTypes();
    if (targetType != null)
        allBaseTypes.push(...targetType.getBaseTypes());

    return allBaseTypes.some(t => hasDescendantBaseType(t, isMatch));
}
