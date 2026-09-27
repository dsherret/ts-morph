/**
 * `getChildren()` for the tsgo AST.
 *
 * The implementation lives in the fork, at
 * `packages/typescript/src/ast/astnav.ts`, because it needs the fork's
 * own scanner and node factory and because every remote node exposes it as a
 * `getChildren()` method. It is re-exported here as a free function so callers
 * that hold a node without knowing its class can still use it.
 */
export { getChildren, getLastToken } from "../../../../submodules/typescript-go/packages/typescript/dist/ast/astnav.js";
