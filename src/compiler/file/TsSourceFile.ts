import * as ts from "typescript";
import * as path from "path";
import * as structures from "./../../structures";
import {CompilerFactory} from "./../../factories";
import {TsNode} from "./../common";
import {TsEnumDeclaration} from "./../enum";

export class TsSourceFile extends TsNode<ts.SourceFile> {
    addEnumDeclaration(structure: structures.EnumStructure) {
        this.ensureLastChildTextNewLine();
        const text = `enum ${structure.name} {\n}\n`;
        this.insertText(this.getEnd(), text);
        const mainChildren = this.getMainChildren();
        const tsDeclaration = mainChildren[mainChildren.length - 2] as TsEnumDeclaration;
        for (let member of structure.members || []) {
            tsDeclaration.addMember(member);
        }
        return tsDeclaration;
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
}
