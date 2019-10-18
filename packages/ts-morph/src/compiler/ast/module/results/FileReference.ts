import { ts } from "@ts-morph/common";
import { TextRange } from "../../common";
import { SourceFile } from "../../module";

export class FileReference extends TextRange<ts.FileReference> {
    /* @private */
    constructor(compilerObject: ts.FileReference, sourceFile: SourceFile) {
        super(compilerObject, sourceFile);
    }

    /** Gets the referenced file name. */
    getFileName() {
        return this.compilerObject.fileName;
    }
}
