import { ts } from "@ts-morph/common";

export interface ForEachDescendantTraversalControl {
  /**
   * Stops traversal.
   */
  stop(): void;
  /**
   * Skips traversal of the current node's descendants.
   */
  skip(): void;
  /**
   * Skips traversal of the current node, siblings, and all their descendants.
   */
  up(): void;
}
