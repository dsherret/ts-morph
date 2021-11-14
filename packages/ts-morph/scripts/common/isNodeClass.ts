import { tsMorph } from "../deps.ts";
import { hasDescendantNodeType } from "./typeHelpers.ts";

export function isNodeClass(classDec: tsMorph.ClassDeclaration) {
  if (classDec.getName() === "Node")
    return true;
  return classDec.getBaseTypes().some(t => hasDescendantNodeType(t));
}
