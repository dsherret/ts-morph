import { Node } from "../../compiler";

export function getNodeByNameOrFindFunction<T extends Node>(items: T[], nameOrFindFunc: ((declaration: T) => boolean) | string) {
  let findFunc: (declaration: T) => boolean;

  if (typeof nameOrFindFunc === "string")
    findFunc = dec => nodeHasName(dec, nameOrFindFunc);
  else
    findFunc = nameOrFindFunc;

  return items.find(findFunc);
}

export function nodeHasName(node: Node, name: string): boolean {
  if ((node as any).getNameNode == null)
    return false;
  // An elision in an array binding pattern — the hole in `const [, a] = x` — is a
  // BindingElement with no name at all, where the `typescript` package produced an
  // OmittedExpression. Asking it for its name node throws, so the check has to
  // happen before the call rather than on its result.
  if ((node.compilerNode as { name?: unknown }).name == null && Node.isBindingElement(node))
    return false;
  const nameNode = (node as any).getNameNode() as Node;
  if (nameNode == null)
    return false;
  if (Node.isArrayBindingPattern(nameNode) || Node.isObjectBindingPattern(nameNode))
    return nameNode.getElements().some(element => nodeHasName(element, name));
  const nodeName = (node as any).getName != null ? (node as any).getName() : nameNode.getText();
  return nodeName === name;
}

export function getNotFoundErrorMessageForNameOrFindFunction(findName: string, nameOrFindFunction: string | Function) {
  if (typeof nameOrFindFunction === "string")
    return `Expected to find ${findName} named '${nameOrFindFunction}'.`;
  return `Expected to find ${findName} that matched the provided condition.`;
}
