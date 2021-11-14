import { path } from "./deps.ts";

const dirname = path.dirname(path.fromFileUrl(import.meta.url));
const root = path.join(dirname, "../../");
export const folders = {
  scripts: path.join(root, "./packages/scripts"),
  common: path.join(root, "./packages/common"),
  bootstrap: path.join(root, "./packages/bootstrap"),
  tsMorph: path.join(root, "./packages/ts-morph"),
  root,
};
