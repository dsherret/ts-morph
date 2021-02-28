import { NodeRuntime } from "./NodeRuntime";
import { Runtime } from "./Runtime";

export const runtime = getRuntime();

function getRuntime(): Runtime {
    // for now... will add Deno runtime in the future
    return new NodeRuntime();
}
