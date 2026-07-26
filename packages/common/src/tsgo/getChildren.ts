/**
 * `getChildren()` for the tsgo AST.
 *
 * The implementation lives in the fork, at
 * `_packages/native-preview/src/ast/children.ts`, because it needs the fork's
 * own scanner and node factory and because every remote node exposes it as a
 * `getChildren()` method. It is re-exported here as a free function so callers
 * that hold a node without knowing its class can still use it.
 */
export { getChildren, getLastToken } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/children.js";
