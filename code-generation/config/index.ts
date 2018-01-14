import * as path from "path";

export * from "./isAllowedClass";
export * from "./isAllowedMixin";
export * from "./isAllowedMixinForStructure";
export * from "./isOverloadStructure";

export const rootFolder = path.join(__dirname, "../../../"); // three because this script is generated into a dist folder
