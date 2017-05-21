import * as ts from "typescript";
import {DecoratorStructure} from "./../../structures";
import {getEndIndexFromArray, verifyAndGetIndex, insertCreatingSyntaxList, insertIntoSyntaxList} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {Decorator} from "./../decorator/Decorator";

export type DecoratableNodeExtensionType = Node<ts.Node & { decorators: ts.NodeArray<ts.Decorator>; }>;

export interface DecoratableNode {
    /**
     * Gets all the decorators of the node.
     */
    getDecorators(): Decorator[];
    /**
     * Adds a decorator.
     * @param structure - Structure of the decorator.
     * @param sourceFile - Optional source file to help with performance.
     */
    addDecorator(structure: DecoratorStructure, sourceFile?: SourceFile): Decorator;
    /**
     * Adds decorators.
     * @param structures - Structures of the decorators.
     * @param sourceFile - Optional source file to help with performance.
     */
    addDecorators(structures: DecoratorStructure[], sourceFile?: SourceFile): Decorator[];
    /**
     * Inserts a decorator.
     * @param index - Index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the decorator.
     * @param sourceFile - Optional source file to help with performance.
     */
    insertDecorator(index: number, structure: DecoratorStructure, sourceFile?: SourceFile): Decorator;
    /**
     * Insert decorators.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     * @param sourceFile - Optional source file to help with performance
     */
    insertDecorators(index: number, structures: DecoratorStructure[], sourceFile?: SourceFile): Decorator[];
}

export function DecoratableNode<T extends Constructor<DecoratableNodeExtensionType>>(Base: T): Constructor<DecoratableNode> & T {
    return class extends Base implements DecoratableNode {
        getDecorators(): Decorator[] {
            if (this.node.decorators == null)
                return [];
            return this.node.decorators.map(d => this.factory.getDecorator(d));
        }

        addDecorator(structure: DecoratorStructure, sourceFile = this.getRequiredSourceFile()) {
            return this.insertDecorator(getEndIndexFromArray(this.node.decorators), structure, sourceFile);
        }

        addDecorators(structures: DecoratorStructure[], sourceFile = this.getRequiredSourceFile()) {
            return this.insertDecorators(getEndIndexFromArray(this.node.decorators), structures, sourceFile);
        }

        insertDecorator(index: number, structure: DecoratorStructure, sourceFile = this.getRequiredSourceFile()) {
            return this.insertDecorators(index, [structure], sourceFile)[0];
        }

        insertDecorators(index: number, structures: DecoratorStructure[], sourceFile = this.getRequiredSourceFile()) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const decoratorLines = getDecoratorLines(structures);
            const decorators = this.getDecorators();
            const newLineText = this.factory.getLanguageService().getNewLine();
            index = verifyAndGetIndex(index, decorators.length);

            if (decorators.length === 0) {
                const indentationText = this.getIndentationText(sourceFile);
                const decoratorCode = prependIndentationText(decoratorLines, indentationText).join(newLineText) + newLineText;
                insertCreatingSyntaxList(sourceFile, this.getStart(sourceFile) - indentationText.length, decoratorCode);
            }
            else {
                const nextDecorator = decorators[index];
                if (nextDecorator == null) {
                    const previousDecorator = decorators[index - 1];
                    const indentationText = previousDecorator.getIndentationText(sourceFile);
                    const decoratorCode = newLineText + prependIndentationText(decoratorLines, indentationText).join(newLineText);
                    insertIntoSyntaxList(sourceFile, previousDecorator.getEnd(), decoratorCode, decorators[0].getRequiredParentSyntaxList(), index, structures.length);
                }
                else {
                    const indentationText = nextDecorator.getIndentationText(sourceFile);
                    let decoratorCode = decoratorLines[0] + newLineText;
                    if (decoratorLines.length > 1)
                        decoratorCode += prependIndentationText(decoratorLines.slice(1), indentationText).join(newLineText) + newLineText;
                    decoratorCode += indentationText;
                    insertIntoSyntaxList(sourceFile, nextDecorator.getStart(sourceFile), decoratorCode, decorators[0].getRequiredParentSyntaxList(), index, structures.length);
                }
            }

            return this.getDecorators().slice(index, index + structures.length);
        }
    };
}

function getDecoratorLines(structures: DecoratorStructure[]) {
    const lines: string[] = [];
    for (const structure of structures) {
        let line = `@${structure.name}`;
        if (structure.arguments != null)
            line += `(${structure.arguments.join(", ")})`;
        lines.push(line);
    }
    return lines;
}

function prependIndentationText(lines: string[], indentationText: string) {
    return lines.map(l => indentationText + l);
}
