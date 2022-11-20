import { Node } from "./common/Node";

/** @internal */
export function callBaseGetStructure<T extends Record<string, any>>(basePrototype: any, node: Node, structure: MakeRequired<T> | undefined): any {
  let newStructure: T;
  if (basePrototype.getStructure != null)
    newStructure = basePrototype.getStructure.call(node);
  else
    newStructure = {} as any;

  if (structure != null)
    Object.assign(newStructure as any, structure);

  return newStructure;
}
