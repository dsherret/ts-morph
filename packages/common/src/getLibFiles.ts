export function getLibFiles() {
    const libFiles: typeof import("./data/libFiles") = require("./data/libFiles");
    return libFiles.libFiles;
}
