import * as ts from "typescript";
import {CompilerFactory} from "./../factories";
import {TsNode} from "./TsNode";
import * as path from "path";

export class TsSourceFile extends TsNode<ts.SourceFile> {
    constructor(factory: CompilerFactory, sourceFile: ts.SourceFile) {
        super(factory, sourceFile, null);
    }

    getFileName() {
        return this.node.fileName;
    }

    getReferencedFiles() {
        const dirName = path.dirname(this.getFileName());
        return (this.node.referencedFiles || []).map(f => this.factory.getSourceFileFromFilePath(path.join(dirName, f.fileName)));
    }

    isSourceFile() {
        return true;
    }

    replaceText(replaceStart: number, replaceEnd: number, newText: string) {
        const difference = newText.length - (replaceEnd - replaceStart);
        this.node.text = this.node.text.substring(0, replaceStart) + newText + this.node.text.substring(replaceEnd);
        this.node.end += difference;

        this.getAllChildren().forEach(child => {
            const node = child.getCompilerNode();
            const currentStart = node.pos;

            if (child.containsRange(replaceStart, replaceEnd)) {
                const text = (node as any).text as string | undefined;
                if (text != null) {
                    const relativeStart = replaceStart - currentStart;
                    const relativeEnd = replaceEnd - currentStart;
                    (node as any).text = text.substring(0, relativeStart) + newText + text.substring(relativeEnd);
                }
                node.end += difference;
            }
            else if (currentStart > replaceStart) {
                node.pos += difference;
                node.end += difference;
            }
        });
    }
}
