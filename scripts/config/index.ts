import * as path from "path";
export * from "./isAllowedMixin";
export * from "./isAllowedMixinForStructure";
export * from "./isOverloadStructure";

export const rootFolder = path.join(__dirname, "../../");
// todo: read from package.json
export const tsVersionsToTest = [
    "3.0.1",
    "3.0.3",
    "3.1.1"
];
