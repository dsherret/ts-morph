import * as path from "path";

export * from "./config/isAllowedClass";
export * from "./config/isAllowedMixin";

export const rootFolder = path.join(__dirname, "../../"); // two because this script is generated into a dist folder