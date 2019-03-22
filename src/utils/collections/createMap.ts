import { Es5Map } from "./Es5Map";
import { Map } from "./Map";

export function createMap<T, U>(): Map<T, U> {
    return typeof Map === "undefined" ? new Es5Map<T, U>() : new Map<T, U>();
}
