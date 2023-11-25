import { ts } from "@ts-morph/common";
import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
import { getParentSyntaxList } from "../../utils";
import { NodeHandler } from "./NodeHandler";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

/**
 * Replacement handler that tries to find the parents.
 */
export class ParentFinderReplacementNodeHandler extends StraightReplacementNodeHandler {
    readonly #changingParent: Node;
    readonly #parentNodeHandler: NodeHandler;
  readonly #changingParentParent: Node | undefined;
  #foundParent = false;
  readonly #parentsAtSamePos: boolean;

  constructor(compilerFactory: CompilerFactory, parentNodeHandler: NodeHandler, changingParent: Node) {
    super(compilerFactory);
    this.#changingParentParent = this.#changingParent.getParentSyntaxList() || this.#changingParent.getParent();
    this.#parentsAtSamePos = this.#changingParentParent != null && this.#changingParentParent.getPos() === this.#changingParent.getPos();
      this.#parentNodeHandler = parentNodeHandler;
      this.#changingParent = changingParent;
  }

  handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
    if (!this.#foundParent && this.#isParentNode(newNode, newSourceFile)) {
      this.#foundParent = true; // don't bother checking for the parent once it's found
      this.#parentNodeHandler.handleNode(currentNode, newNode, newSourceFile);
    } else {
      super.handleNode(currentNode, newNode, newSourceFile);
    }
  }

  #isParentNode(newNode: ts.Node, newSourceFile: ts.SourceFile) {
    const positionsAndKindsEqual = areNodesEqual(newNode, this.#changingParent)
      && areNodesEqual(getParentSyntaxList(newNode, newSourceFile) || newNode.parent, this.#changingParentParent);

    if (!positionsAndKindsEqual)
      return false;

    if (!this.#parentsAtSamePos)
      return true;

    // Need to do some additional checks if the parents are in the same position.
    // For example, some nodes like `this` in `this.is.nested.deep;`... in this case, just check the depths are equal
    return getAncestorLength(this.#changingParent.compilerNode) === getAncestorLength(newNode);

    function getAncestorLength(nodeToCheck: ts.Node) {
      let node = nodeToCheck;
      let count = 0;
      while (node.parent != null) {
        count++;
        node = node.parent;
      }
      return count;
    }
  }
}

function areNodesEqual(a: ts.Node | undefined, b: Node | undefined) {
  if (a == null && b == null)
    return true;
  if (a == null || b == null)
    return false;
  if (a.pos === b.getPos() && a.kind === b.getKind())
    return true;
  return false;
}
