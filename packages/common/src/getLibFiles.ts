/** Loads the lib files that are stored in a separate module. */
export function getLibFiles() {
    const libFiles: typeof import("./data/libFiles") = require("./data/libFiles");
    return libFiles.libFiles;
}
