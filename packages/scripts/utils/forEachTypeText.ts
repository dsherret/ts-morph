import { tsMorph } from "../deps.ts";

export function forEachTypeText(structure: tsMorph.Structures, func: (typeText: string) => string) {
  forEachChild(structure);

  function forEachChild(child: tsMorph.Structures) {
    if (tsMorph.Structure.isTyped(child) && child.type != null)
      child.type = withType(child.type);
    if (tsMorph.Structure.isReturnTyped(child) && child.returnType != null)
      child.returnType = withType(child.returnType);
    if (tsMorph.Structure.isTypeParameter(child) && child.constraint != null)
      child.constraint = withType(child.constraint);

    tsMorph.forEachStructureChild(child, forEachChild);
  }

  function withType(text: string | tsMorph.WriterFunction) {
    if (typeof text !== "string")
      throw new Error("Unhandled scenario where the type text was not a string.");

    return func(text);
  }
}
