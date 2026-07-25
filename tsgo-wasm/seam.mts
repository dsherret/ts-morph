/**
 * Re-export of the tsgo adapter, which lives in @ts-morph/common.
 *
 * The scripts in this directory exercise the adapter end-to-end; the adapter
 * itself is part of the library, at packages/common/src/tsgo.
 */
export {
    createInProcessApi,
    type InProcessApiOptions,
} from "../packages/common/src/tsgo/inProcessApi.ts";
export type { API, FileSystem } from "../packages/common/src/tsgo/inProcessApi.ts";
