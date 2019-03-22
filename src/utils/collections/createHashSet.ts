import { HashSet } from "./HashSet";
import { Es5HashSet } from "./Es5HashSet";

export function createHashSet<T>(): HashSet<T> {
    if (typeof Set !== "undefined")
        return new Set<T>();
    return new Es5HashSet<T>();
}
