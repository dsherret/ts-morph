import { BrowserRuntime } from "./BrowserRuntime";
import { NodeRuntime } from "./NodeRuntime";
import { Runtime } from "./Runtime";

export const runtime = getRuntime();

function getRuntime(): Runtime {
    if (isNodeJs())
        return new NodeRuntime();
    else
        return new BrowserRuntime();
}

function isNodeJs() {
    // https://stackoverflow.com/a/31456668/188246
    return typeof globalThis.process === "object"
        && typeof globalThis.process.versions === "object"
        && typeof globalThis.process.versions.node !== "undefined";
}
