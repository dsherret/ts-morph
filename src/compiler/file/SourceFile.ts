import * as ts from "typescript";
import * as path from "path";
import * as structures from "./../../structures";
import {CompilerFactory} from "./../../factories";
import {Node} from "./../common";
import {EnumDeclaration} from "./../enum";

export class SourceFile extends Node<ts.SourceFile> {
    addEnumDeclaration(structure: structures.EnumStructure) {
        this.ensureLastChildTextNewLine();
        const text = `enum ${structure.name} {\n}\n`;
        this.insertText(this.getEnd(), text);
        const mainChildren = this.getMainChildren();
        const declaration = mainChildren[mainChildren.length - 2] as EnumDeclaration;
        for (let member of structure.members || []) {
            declaration.addMember(member);
        }
        return declaration;
    }

    getEnumDeclarations() {
        return this.getMainChildren().filter(c => c instanceof EnumDeclaration) as EnumDeclaration[];
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

     /**
     * Inserts text at a given position. Will reconstruct the underlying source file.
     * @internal
     * @param insertPos - Insert position.
     * @param newText - Text to insert.
     */
    insertText(insertPos: number, newText: string) {
        const sourceFile = this.getRequiredSourceFile();
        const currentText = sourceFile.getFullText();
        const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
        const tempSourceFile = this.factory.createTempSourceFileFromText(newFileText, sourceFile.getFileName());

        // temp solution
        function* wrapper() {
            for (let value of Array.from(sourceFile.getAllChildren()).map(t => t.getCompilerNode())) {
                yield value;
            }
        }

        // console.log(Array.from(sourceFile.getAllChildren()).map(t => t.getKindName() + ":" + t.getPos() + ":" + t.getStart()));
        // console.log(Array.from(tempSourceFile.getAllChildren()).map(t => t.getKindName() + ":" + t.getPos() + ":" + t.getStart()));
        const currentFileChildIterator = wrapper();
        const tempFileChildIterator = tempSourceFile.getAllChildren(tempSourceFile);
        let currentChild = currentFileChildIterator.next().value;
        let hasPassed = false;

        for (let newChild of tempFileChildIterator) {
            const newChildPos = newChild.getPos();
            const newChildStart = newChild.getStart();

            if (newChildPos <= insertPos && !hasPassed) {
                if (newChild.getKind() !== currentChild.kind) {
                    hasPassed = true;
                    continue;
                }

                if (currentChild.pos !== newChild.getPos()) {
                    throw new Error("Unexpected! Perhaps a syntax error was inserted.");
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
            else if (newChildStart >= insertPos + newText.length) {
                const adjustedPos = newChildStart - newText.length;

                if (currentChild.getStart() !== adjustedPos || currentChild.kind !== newChild.getKind()) {
                    throw new Error("Unexpected! Perhaps a syntax error was inserted.");
                }

                this.factory.replaceCompilerNode(currentChild, newChild.getCompilerNode());
                currentChild = currentFileChildIterator.next().value;
            }
        }

        this.factory.replaceCompilerNode(sourceFile, tempSourceFile.getCompilerNode());
    }

    /**
     * Replaces text in a source file. Good for renaming identifiers. Not good for creating new nodes!
     * @internal
     * @param replaceStart - Start of where to replace.
     * @param replaceEnd - End of where to replace.
     * @param newText - The new text to go in place.
     */
    replaceText(replaceStart: number, replaceEnd: number, newText: string) {
        const difference = newText.length - (replaceEnd - replaceStart);
        const sourceFile = this;

        replaceForNode(this);

        function replaceForNode(node: Node<ts.Node>) {
            const currentStart = node.getStart(sourceFile);
            const compilerNode = node.getCompilerNode();

            // do the children first so that the underlying _children array is filled in based on the source file
            for (let child of node.getChildren(sourceFile)) {
                replaceForNode(child);
            }

            if (node.containsRange(replaceStart, replaceEnd)) {
                const text = (compilerNode as any).text as string | undefined;
                if (text != null) {
                    const relativeStart = replaceStart - currentStart;
                    const relativeEnd = replaceEnd - currentStart;
                    (compilerNode as any).text = text.substring(0, relativeStart) + newText + text.substring(relativeEnd);
                }
                compilerNode.end += difference;
            }
            else if (currentStart > replaceStart) {
                compilerNode.pos += difference;
                compilerNode.end += difference;
            }
        }
    }
}
